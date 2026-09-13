// Adapted from https://github.com/codingshreyash/codingshreyash.github.io/blob/main/split/index.html

(function () {
  "use strict";
  var root = document.querySelector(".split-app");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  // Scans go through our server; no API credentials are sent to the browser.
  var SHARED_DAILY_LIMIT = 10;

  /* ============================================================
     constants + tiny helpers
     ============================================================ */
  var PALETTE = [
    "#0090ff",
    "#e5484d",
    "#30a46c",
    "#f76b15",
    "#8e4ec6",
    "#e93d82",
    "#12a594",
    "#ffb224",
    "#3e63dd",
    "#46a758",
  ];
  var LS = { state: "dt.split.v1.state", recent: "dt.split.v1.recent" };
  var MAX_PEOPLE = 10;

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var el = function (tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };
  function uid() {
    return "x" + Math.random().toString(36).slice(2, 9);
  }
  function cents(v) {
    var n = parseFloat(v);
    return isFinite(n) ? Math.round(n * 100) : 0;
  }
  function money(c) {
    var neg = c < 0,
      a = Math.abs(c);
    return (neg ? "-$" : "$") + (a / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
    });
  }
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
    }, 1900);
  }

  /* ============================================================
     state
     ============================================================ */
  var state = {
    step: "people",
    people: [],
    items: [],
    tax: "",
    fees: "",
    tip: "",
    tipMode: "pct",
    expectedTotal: null,
    expectedSubtotal: null,
    place: "",
    when: "",
    image: null,
  };

  function newPerson(name) {
    var used = state.people.map(function (p) {
      return p.color;
    });
    var free = PALETTE.filter(function (c) {
      return used.indexOf(c) === -1;
    });
    return {
      id: uid(),
      name: name || "",
      color: free.length ? free[0] : PALETTE[state.people.length % PALETTE.length],
    };
  }
  function newItem(name, price, all) {
    return {
      id: uid(),
      name: name || "",
      price: price === 0 || price ? Number(price).toFixed(2) : "",
      assignees:
        all === false
          ? []
          : state.people.map(function (p) {
              return p.id;
            }),
    };
  }

  function save() {
    try {
      localStorage.setItem(LS.state, JSON.stringify(state));
    } catch {
      // a receipt photo can push us past the ~5MB quota; the numbers matter more than the picture
      try {
        var img = state.image;
        state.image = null;
        localStorage.setItem(LS.state, JSON.stringify(state));
        state.image = img;
      } catch {}
    }
  }
  function load() {
    try {
      var raw = localStorage.getItem(LS.state);
      if (!raw) return false;
      var s = JSON.parse(raw);
      if (!s || !Array.isArray(s.people)) return false;
      Object.keys(state).forEach(function (k) {
        if (s[k] !== undefined) state[k] = s[k];
      });
      return true;
    } catch {
      return false;
    }
  }
  function recents() {
    try {
      return JSON.parse(localStorage.getItem(LS.recent) || "[]");
    } catch {
      return [];
    }
  }
  function rememberNames() {
    var seen = {},
      out = [];
    state.people
      .concat(
        recents().map(function (n) {
          return { name: n };
        }),
      )
      .forEach(function (p) {
        var n = (p.name || "").trim();
        if (n && !seen[n.toLowerCase()]) {
          seen[n.toLowerCase()] = 1;
          out.push(n);
        }
      });
    try {
      localStorage.setItem(LS.recent, JSON.stringify(out.slice(0, 12)));
    } catch {}
  }

  /* ============================================================
     split math: integer cents, largest-remainder allocation
     so the parts always add back up to the whole
     ============================================================ */
  function distribute(total, weights) {
    var n = weights.length,
      out = Array.from({ length: n }, function () {
        return 0;
      }),
      i;
    if (!n || total === 0) return out;
    var w = weights.slice(),
      sum = 0;
    for (i = 0; i < n; i++) sum += w[i];
    if (sum <= 0) {
      for (i = 0; i < n; i++) w[i] = 1;
      sum = n;
    }

    var exact = [],
      floors = [],
      acc = 0;
    for (i = 0; i < n; i++) {
      var e = (total * w[i]) / sum;
      exact.push(e);
      var f = Math.floor(e);
      floors.push(f);
      acc += f;
    }
    var rem = total - acc; // always 0..n-1
    var order = exact
      .map(function (e, k) {
        return { k: k, frac: e - Math.floor(e) };
      })
      .sort(function (a, b) {
        return b.frac - a.frac || a.k - b.k;
      });
    for (i = 0; i < n; i++) out[i] = floors[i];
    for (i = 0; i < rem; i++) out[order[i % n].k] += 1;
    return out;
  }

  function compute() {
    var ids = state.people.map(function (p) {
      return p.id;
    });
    var owed = {},
      lines = {};
    ids.forEach(function (id) {
      owed[id] = 0;
      lines[id] = [];
    });

    var subtotal = 0,
      orphanCents = 0,
      orphanCount = 0;

    state.items.forEach(function (it) {
      var c = cents(it.price);
      subtotal += c;
      var a = it.assignees.filter(function (id) {
        return ids.indexOf(id) > -1;
      });
      if (!a.length) {
        orphanCents += c;
        if (c) orphanCount++;
        return;
      }
      var parts = distribute(
        c,
        a.map(function () {
          return 1;
        }),
      );
      a.forEach(function (id, i) {
        owed[id] += parts[i];
        lines[id].push({ name: it.name || "item", cents: parts[i], ways: a.length });
      });
    });

    var taxC = cents(state.tax);
    var feeC = cents(state.fees);
    var tipC =
      state.tipMode === "pct"
        ? Math.round(subtotal * ((parseFloat(state.tip) || 0) / 100))
        : cents(state.tip);

    // extras ride along in proportion to what each person's own items came to
    var weights = ids.map(function (id) {
      return Math.max(0, owed[id]);
    });
    [
      ["tax", taxC],
      ["fees", feeC],
      ["tip", tipC],
    ].forEach(function (pair) {
      if (!pair[1]) return;
      var parts = distribute(pair[1], weights);
      ids.forEach(function (id, i) {
        if (!parts[i]) return;
        owed[id] += parts[i];
        lines[id].push({ name: pair[0], cents: parts[i], extra: true });
      });
    });

    return {
      ids: ids,
      owed: owed,
      lines: lines,
      subtotal: subtotal,
      taxC: taxC,
      feeC: feeC,
      tipC: tipC,
      grand: subtotal + taxC + feeC + tipC,
      orphanCents: orphanCents,
      orphanCount: orphanCount,
    };
  }

  /* ============================================================
     screen 1: people
     ============================================================ */
  function renderPeople() {
    var grid = $("#people-grid");
    grid.innerHTML = "";
    state.people.forEach(function (p, idx) {
      var row = el("div", "person-edit");

      var sw = el("button", "swatch");
      sw.type = "button";
      sw.style.background = p.color;
      sw.title = "change colour";
      sw.setAttribute("aria-label", "Change colour for " + (p.name || "person " + (idx + 1)));
      sw.onclick = function () {
        p.color = PALETTE[(PALETTE.indexOf(p.color) + 1) % PALETTE.length];
        sw.style.background = p.color;
        save();
        renderItems();
        renderTallies();
      };

      var nm = el("input");
      nm.type = "text";
      nm.value = p.name;
      nm.placeholder = idx === 0 ? "me" : "name";
      nm.maxLength = 18;
      nm.setAttribute("aria-label", "Name for person " + (idx + 1));
      nm.oninput = function () {
        p.name = nm.value;
        save();
        renderItems();
        renderTallies();
        syncBar();
      };

      var rm = el("button", "rm");
      rm.type = "button";
      rm.textContent = "×";
      rm.title = "remove";
      rm.setAttribute("aria-label", "Remove " + (p.name || "person " + (idx + 1)));
      rm.onclick = function () {
        state.people = state.people.filter(function (q) {
          return q.id !== p.id;
        });
        state.items.forEach(function (it) {
          it.assignees = it.assignees.filter(function (id) {
            return id !== p.id;
          });
        });
        save();
        renderPeople();
        renderItems();
        renderTallies();
        syncBar();
      };

      row.appendChild(sw);
      row.appendChild(nm);
      row.appendChild(rm);
      grid.appendChild(row);
    });

    $("#add-person").disabled = state.people.length >= MAX_PEOPLE;
    renderRecents();
  }

  function renderRecents() {
    var box = $("#recents");
    var have = state.people.map(function (p) {
      return (p.name || "").trim().toLowerCase();
    });
    var pool = recents().filter(function (n) {
      return have.indexOf(n.toLowerCase()) === -1;
    });
    $$(".recent-chip", box).forEach(function (n) {
      n.remove();
    });
    if (!pool.length || state.people.length >= MAX_PEOPLE) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    pool.slice(0, 8).forEach(function (name) {
      var b = el("button", "recent-chip");
      b.type = "button";
      b.textContent = "+ " + name;
      b.onclick = function () {
        addPerson(name);
      };
      box.appendChild(b);
    });
  }

  function addPerson(name) {
    if (state.people.length >= MAX_PEOPLE) return;
    var p = newPerson(name);
    state.people.push(p);
    // a brand-new person joins every line that everyone else was already on
    state.items.forEach(function (it) {
      if (it.assignees.length === state.people.length - 1) it.assignees.push(p.id);
    });
    save();
    renderPeople();
    renderItems();
    renderTallies();
    syncBar();
  }

  /* ============================================================
     screen 2: items
     ============================================================ */
  function initials(p, idx) {
    var n = (p.name || "").trim();
    if (!n) return String(idx + 1);
    var parts = n.split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : n.slice(0, 2)).toUpperCase();
  }

  function renderItems() {
    var list = $("#items-list");
    list.innerHTML = "";
    state.items.forEach(function (it) {
      list.appendChild(itemRow(it));
    });
    if (!state.items.length) {
      var empty = el("div", "note");
      empty.style.padding = "18px 2px";
      empty.textContent = "No lines yet. Scan a receipt or add them by hand.";
      list.appendChild(empty);
    }
    refreshBanner();
  }

  function itemRow(it) {
    var row = el("div", "item");
    row.dataset.id = it.id;

    var top = el("div", "item-top");
    var nm = el("input", "nm");
    nm.type = "text";
    nm.value = it.name;
    nm.placeholder = "item";
    nm.setAttribute("aria-label", "Item name");
    nm.oninput = function () {
      it.name = nm.value;
      save();
    };

    var cur = el("span", "cur");
    cur.textContent = "$";
    var pr = el("input", "pr");
    pr.type = "number";
    pr.step = "0.01";
    pr.inputMode = "decimal";
    pr.value = it.price;
    pr.placeholder = "0.00";
    pr.setAttribute("aria-label", "Item price");
    pr.oninput = function () {
      it.price = pr.value;
      save();
      refreshRow(it.id);
      renderTallies();
      syncBar();
    };

    var del = el("button", "del");
    del.type = "button";
    del.textContent = "×";
    del.title = "delete line";
    del.setAttribute("aria-label", "Delete line");
    del.onclick = function () {
      state.items = state.items.filter(function (q) {
        return q.id !== it.id;
      });
      save();
      renderItems();
      renderTallies();
      syncBar();
    };

    top.appendChild(nm);
    top.appendChild(cur);
    top.appendChild(pr);
    top.appendChild(del);

    var bot = el("div", "item-bot");
    bot.appendChild(el("div", "chips"));
    var st = el("div", "stepper");
    var minus = el("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Split this line fewer ways");
    var val = el("div", "val");
    var plus = el("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Split this line more ways");

    minus.onclick = function () {
      stepWays(it, -1);
    };
    plus.onclick = function () {
      stepWays(it, 1);
    };

    st.appendChild(minus);
    st.appendChild(val);
    st.appendChild(plus);
    bot.appendChild(st);

    var each = el("div", "each");

    row.appendChild(top);
    row.appendChild(bot);
    row.appendChild(each);
    paint(row, it);
    return row;
  }

  // − takes a person off the line (each remaining share grows: 1/3 → 1/2)
  // + puts the next person on it   (each share shrinks: 1/2 → 1/3)
  function stepWays(it, delta) {
    var ids = state.people.map(function (p) {
      return p.id;
    });
    var on = it.assignees.filter(function (id) {
      return ids.indexOf(id) > -1;
    });
    if (delta > 0) {
      var next = ids.filter(function (id) {
        return on.indexOf(id) === -1;
      })[0];
      if (!next) return;
      on.push(next);
    } else {
      if (!on.length) return;
      on.pop();
    }
    it.assignees = on;
    save();
    refreshRow(it.id);
    renderTallies();
    syncBar();
    refreshBanner();
  }

  function paint(row, it) {
    var ids = state.people.map(function (p) {
      return p.id;
    });
    it.assignees = it.assignees.filter(function (id) {
      return ids.indexOf(id) > -1;
    });
    var n = it.assignees.length;

    var chips = $(".chips", row);
    chips.innerHTML = "";
    state.people.forEach(function (p, idx) {
      var on = it.assignees.indexOf(p.id) > -1;
      var c = el("button", "chip");
      c.type = "button";
      c.setAttribute("aria-pressed", on ? "true" : "false");
      c.title =
        (p.name || "Person " + (idx + 1)) + (on ? " is on this line" : " is not on this line");
      c.style.color = on ? "#fff" : p.color;
      c.style.background = on ? p.color : "transparent";
      c.style.borderColor = on ? p.color : "";
      c.appendChild(document.createTextNode(initials(p, idx)));
      c.onclick = function () {
        var i = it.assignees.indexOf(p.id);
        if (i > -1) it.assignees.splice(i, 1);
        else it.assignees.push(p.id);
        it.assignees.sort(function (a, b) {
          return ids.indexOf(a) - ids.indexOf(b);
        });
        save();
        refreshRow(it.id);
        renderTallies();
        syncBar();
        refreshBanner();
      };
      chips.appendChild(c);
    });

    var st = $(".stepper", row);
    var btns = $$("button", st);
    btns[0].disabled = n === 0;
    btns[1].disabled = n >= state.people.length;
    $(".val", st).innerHTML =
      n === 0 ? "<b>none</b>" : n === 1 ? "<b>all</b> of it" : "<b>1/" + n + "</b> each";

    var c = cents(it.price);
    var each = $(".each", row);
    if (n === 0) {
      each.className = "each warnrow";
      each.textContent = "nobody on this line, " + money(c) + " unassigned";
      row.classList.add("flagged");
    } else {
      each.className = "each";
      row.classList.remove("flagged");
      var parts = distribute(
        c,
        it.assignees.map(function () {
          return 1;
        }),
      );
      var lo = Math.min.apply(null, parts),
        hi = Math.max.apply(null, parts);
      each.textContent =
        money(c) +
        " ÷ " +
        n +
        " = " +
        (lo === hi ? money(hi) + " each" : money(lo) + " to " + money(hi) + " each");
    }
  }

  function refreshRow(id) {
    var row = $('.item[data-id="' + id + '"]');
    var it = state.items.filter(function (q) {
      return q.id === id;
    })[0];
    if (row && it) paint(row, it);
  }

  function renderTallies() {
    var r = compute(),
      box = $("#tallies");
    renderRecon(r);
    box.innerHTML = "";
    state.people.forEach(function (p, idx) {
      var t = el("div", "tally");
      var b = el("span", "bead");
      b.style.background = p.color;
      t.appendChild(b);
      t.appendChild(document.createTextNode((p.name || "Person " + (idx + 1)) + " "));
      var s = el("b");
      s.textContent = money(r.owed[p.id] || 0);
      t.appendChild(s);
      box.appendChild(t);
    });
    if (state.people.length) {
      var tot = el("div", "tally");
      tot.style.borderStyle = "dashed";
      tot.innerHTML = "total <b>" + money(r.grand) + "</b>";
      box.appendChild(tot);
    }
  }

  // the receipt prints its own total; compare against it before trusting the scan
  function renderRecon(r) {
    var rc = $("#recon");
    var printed, mine, label;
    // prefer the printed subtotal: it checks the line items alone, without
    // depending on whether tax got typed in yet
    if (state.expectedSubtotal != null) {
      printed = cents(state.expectedSubtotal);
      mine = r.subtotal;
      label = "subtotal";
    } else if (state.expectedTotal != null) {
      printed = cents(state.expectedTotal);
      mine = r.subtotal + r.taxC + r.feeC;
      label = "total";
    } else {
      rc.hidden = true;
      return;
    }
    if (!state.items.length) {
      rc.hidden = true;
      return;
    }

    var diff = mine - printed;
    rc.hidden = false;
    if (diff === 0) {
      rc.className = "recon ok";
      rc.innerHTML =
        "Lines add up to the <b>" + money(printed) + "</b> " + label + " on the receipt.";
    } else {
      rc.className = "recon off";
      rc.innerHTML =
        "Receipt " +
        label +
        " is <b>" +
        money(printed) +
        "</b>, these lines come to <b>" +
        money(mine) +
        "</b>. Off by " +
        money(Math.abs(diff)) +
        ", so a line is probably " +
        (diff < 0 ? "missing." : "duplicated or too high.");
    }
  }

  function refreshBanner() {
    var r = compute(),
      b = $("#unassigned-banner");
    if (r.orphanCount > 0) {
      b.innerHTML =
        "<b>" +
        r.orphanCount +
        " line" +
        (r.orphanCount > 1 ? "s have" : " has") +
        " nobody on " +
        (r.orphanCount > 1 ? "them." : "it.") +
        "</b> " +
        money(r.orphanCents) +
        " is not going to anyone.";
      b.classList.add("show");
    } else {
      b.classList.remove("show");
    }
  }

  /* ============================================================
     screen 3: results
     ============================================================ */
  function renderResults() {
    var r = compute();
    $("#out-place").textContent = (state.place || "").trim() || "Receipt";
    $("#out-when").textContent = (state.when || "").trim() || todayLabel();
    $("#out-grand").textContent = money(r.grand);

    var bits = [money(r.subtotal) + " items"];
    if (r.taxC) bits.push(money(r.taxC) + " tax");
    if (r.feeC) bits.push(money(r.feeC) + " fees");
    if (r.tipC) bits.push(money(r.tipC) + " tip");
    bits.push(state.people.length + (state.people.length === 1 ? " person" : " people"));
    $("#out-sub").textContent = bits.join("  ·  ");

    var host = $("#shares");
    host.innerHTML = "";
    var ordered = state.people.slice().sort(function (a, b) {
      return (r.owed[b.id] || 0) - (r.owed[a.id] || 0);
    });

    ordered.forEach(function (p, idx) {
      var card = el("div", "share");
      var top = el("div", "share-top");
      var bead = el("span", "bead");
      bead.style.background = p.color;
      var nm = el("div", "nm");
      nm.textContent = p.name || "Person " + (idx + 1);
      var amt = el("div", "amt");
      amt.textContent = money(r.owed[p.id] || 0);
      top.appendChild(bead);
      top.appendChild(nm);
      top.appendChild(amt);

      var lines = el("div", "share-lines");
      var merged = mergeLines(r.lines[p.id] || []);
      merged.forEach(function (l) {
        var ln = el("div", "ln");
        var a = el("span"),
          b = el("span");
        a.textContent = l.label;
        b.textContent = money(l.cents);
        ln.appendChild(a);
        ln.appendChild(b);
        lines.appendChild(ln);
      });
      var tot = el("div", "ln tot");
      var ta = el("span"),
        tb = el("span");
      ta.textContent = "their total";
      tb.textContent = money(r.owed[p.id] || 0);
      tot.appendChild(ta);
      tot.appendChild(tb);
      lines.appendChild(tot);

      var caret = el("span", "caret");
      caret.textContent = "\u25B8";
      var cp = el("button", "cp");
      cp.type = "button";
      cp.textContent = "\u29C9";
      cp.title = "Copy " + (p.name || "this") + " share as a message";
      cp.setAttribute("aria-label", "Copy share for " + (p.name || "person " + (idx + 1)));
      cp.onclick = function (e) {
        e.stopPropagation();
        copyText(personText(p, r), null);
      };
      top.insertBefore(caret, bead);
      top.appendChild(cp);

      top.setAttribute("role", "button");
      top.setAttribute("tabindex", "0");
      top.title = "Tap for the line-by-line breakdown";
      top.onclick = function () {
        card.classList.toggle("open");
      };
      top.onkeydown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("open");
        }
      };

      card.appendChild(top);
      card.appendChild(lines);
      host.appendChild(card);
    });

    if (r.orphanCount > 0) {
      var w = el("div", "share");
      w.style.borderColor = "var(--warn)";
      w.innerHTML =
        '<div class="share-top"><span class="bead" style="background:var(--warn)"></span>' +
        '<div class="nm" style="color:var(--warn)">unassigned</div>' +
        '<div class="amt" style="color:var(--warn)">' +
        money(r.orphanCents) +
        "</div></div>" +
        '<div class="note" style="margin-top:8px">' +
        r.orphanCount +
        " line(s) have nobody on them, so this is missing from the shares above.</div>";
      host.appendChild(w);
    }
  }

  function mergeLines(lines) {
    var order = [],
      map = {};
    lines.forEach(function (l) {
      var label = l.extra ? l.name : l.name + (l.ways > 1 ? " (÷" + l.ways + ")" : "");
      if (!map[label]) {
        map[label] = { label: label, cents: 0 };
        order.push(label);
      }
      map[label].cents += l.cents;
    });
    return order.map(function (k) {
      return map[k];
    });
  }

  function todayLabel() {
    var d = new Date();
    return d
      .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      .replace(",", "");
  }

  function personText(p, r) {
    var head =
      ((state.place || "").trim() || "Receipt") +
      ", " +
      ((state.when || "").trim() || todayLabel());
    var out = [head, (p.name || "You") + " " + money(r.owed[p.id] || 0), ""];
    mergeLines(r.lines[p.id] || []).forEach(function (l) {
      out.push("  " + l.label + "  " + money(l.cents));
    });
    out.push("", "total bill " + money(r.grand) + ", split " + state.people.length + " ways");
    return out.join("\n");
  }

  function allText(r) {
    var out = [
      ((state.place || "").trim() || "Receipt") +
        ", " +
        ((state.when || "").trim() || todayLabel()),
      "Total " + money(r.grand),
      "",
    ];
    state.people
      .slice()
      .sort(function (a, b) {
        return (r.owed[b.id] || 0) - (r.owed[a.id] || 0);
      })
      .forEach(function (p, i) {
        out.push((p.name || "Person " + (i + 1)) + " " + money(r.owed[p.id] || 0));
      });
    if (r.taxC || r.feeC || r.tipC) {
      out.push(
        "",
        "includes " +
          [
            r.taxC ? money(r.taxC) + " tax" : "",
            r.feeC ? money(r.feeC) + " fees" : "",
            r.tipC ? money(r.tipC) + " tip" : "",
          ]
            .filter(Boolean)
            .join(" + ") +
          ", split in proportion to items",
      );
    }
    return out.join("\n");
  }

  // every person, each with their own lines under them
  function byPersonText(r) {
    var out = [
      ((state.place || "").trim() || "Receipt") +
        ", " +
        ((state.when || "").trim() || todayLabel()),
      "Total " + money(r.grand) + ", split " + state.people.length + " ways",
      "",
    ];
    state.people
      .slice()
      .sort(function (a, b) {
        return (r.owed[b.id] || 0) - (r.owed[a.id] || 0);
      })
      .forEach(function (p, i) {
        out.push((p.name || "Person " + (i + 1)) + " " + money(r.owed[p.id] || 0));
        var lines = mergeLines(r.lines[p.id] || []);
        if (!lines.length) out.push("  (nothing on this receipt)");
        lines.forEach(function (l) {
          out.push("  " + l.label + "  " + money(l.cents));
        });
        out.push("");
      });
    return out.join("\n").replace(/\n+$/, "");
  }

  function copyText(text, btn) {
    var done = function () {
      if (btn) {
        var o = btn.textContent;
        btn.textContent = "copied ✓";
        setTimeout(function () {
          btn.textContent = o;
        }, 1400);
      }
      toast("copied");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = el("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;left:-1000px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      toast("copy failed, select the text manually");
    }
    ta.remove();
  }

  /* ============================================================
     receipt text -> line items
     ============================================================ */
  var MONEY_END = /(-?\$?\s*(?:\d{1,3}(?:,\d{3})+|\d{1,5})[.,]\d{2}\s*-?)\s*(?:[A-Z]{1,2})?\s*$/;

  // word-bounded noise: lines that carry money but are not things anyone bought
  var NOISE = new RegExp(
    "\\b(" +
      [
        "cash\\s*(back|tend)",
        "visa",
        "mastercard",
        "master\\s*card",
        "amex",
        "american\\s*express",
        "discover",
        "debit",
        "credit\\s*card",
        "acct",
        "account",
        "tender(ed)?",
        "payment",
        "approved",
        "approval",
        "trace",
        "terminal",
        "chip\\s*read",
        "x{4,}\\d*",
        "balance",
        "change\\s*due",
        "amount\\s*due",
        "total\\s*savings",
        "you\\s*saved",
        "savings\\s*total",
        "member\\s*savings",
        "instant\\s*savings",
        "member\\s*\\d+",
        "loyalty",
        "rewards?\\s*(earned|points|balance)",
        "points",
        "items?\\s*sold",
        "number\\s*of\\s*items",
        "cashier",
        "invoice",
        "server",
        "guest",
        "survey",
        "thank",
        "http",
        "www",
        "round(ing)?\\s*(up|adj)",
        "net\\s*sales",
        "gross\\s*sales",
      ].join("|") +
      ")\\b",
    "i",
  );

  // payment words that are noise only when they ARE the line: "CHANGE" is a
  // total, "LEATHER CHANGE PURSE" is something you bought
  var PAY_LABEL =
    /^(change|cash|cash\s*back|debit|credit|visa|balance|tender|total\s*tender|subtotal|total)$/i;

  // label-style noise ending in ':' or '#', where a trailing word boundary can never match
  var NOISE_LABEL =
    /\b(amount|aid|seq|app|auth|ref|acct|account|card|reg|store|order|check|table|op|trans|invoice|term)\s*[:#]/i;

  function parseMoney(raw, line) {
    var neg =
      /-/.test(raw) ||
      /\b(coupon|discount|savings|refund|credit|void|promo|markdown)\b/i.test(line);
    var v = String(raw).replace(/[^0-9.,]/g, "");
    var i = Math.max(v.lastIndexOf("."), v.lastIndexOf(","));
    if (i > -1) v = v.slice(0, i).replace(/[.,]/g, "") + "." + v.slice(i + 1);
    var n = parseFloat(v);
    if (!isFinite(n)) return null;
    return neg ? -n : n;
  }

  function pretty(s) {
    s = s.replace(/\s+/g, " ").trim();
    if (/[a-z]/.test(s)) return s; // already mixed case, leave it
    return s.toLowerCase().replace(/(^|[\s\-/&(])([a-z])/g, function (m, a, b) {
      return a + b.toUpperCase();
    });
  }

  function cleanName(s) {
    return pretty(
      String(s)
        .replace(/^\s*[A-Z]\s+(?=[\d(])/, "") // Costco-style tax-flag column: "E  251680 ..."
        .replace(/^\s*\d{4,}\s*/, "") // item number / UPC / PLU
        .replace(/[|_~^{}[\]]+/g, " ")
        .replace(/\s*\.{2,}\s*/g, " ")
        .replace(/^[\s\-–—:*#./]+/, "")
        .replace(/[\s\-–—:*#.]+$/, ""),
    );
  }

  function parseReceipt(text) {
    var raw = String(text || "").split(/\r?\n/);
    var out = { items: [], tax: null, tip: null, total: null, subtotal: null, place: "" };
    var header = [],
      taxSeen = [],
      totalTax = null;

    raw.forEach(function (line, li) {
      var t = line.replace(/\s+/g, " ").trim();
      if (!t) return;
      if (li < 5) header.push(t);

      var m = t.match(MONEY_END);
      var lower = t.toLowerCase();

      if (!m) {
        // "2 @ 1.99" / "0.86 lb @ $2.99/lb" belongs to the line above
        if (/@/.test(t) && out.items.length) {
          var prev = out.items[out.items.length - 1];
          if (prev.name.length < 40) prev.name += " (" + pretty(t) + ")";
        }
        return;
      }

      var amt = parseMoney(m[1], t);
      if (amt === null) return;

      if (/sub\s*-?\s*total/.test(lower)) {
        out.subtotal = amt;
        return;
      }
      // "A 7.0 % TAX RATE  1.75" restates the tax, it is not another charge
      if (/\btax\s*rate\b/.test(lower)) {
        return;
      }
      if (/\btotal\s*tax\b/.test(lower)) {
        totalTax = amt;
        return;
      }
      if (/\b(sales\s*)?tax\b/.test(lower) && !/taxable/.test(lower)) {
        taxSeen.push(amt);
        return;
      }
      if (/\b(tip|gratuity)\b/.test(lower)) {
        out.tip = amt;
        return;
      }
      if (/\b(grand\s*)?total\b|\bamount\s+due\b|\bbalance\s+due\b/.test(lower)) {
        if (out.total === null) out.total = amt;
        return;
      }
      if (NOISE.test(lower) || NOISE_LABEL.test(lower)) return;

      var name = cleanName(t.slice(0, m.index));
      if (PAY_LABEL.test(name)) return;
      var worded = /[A-Za-z]{2}/.test(name);

      // a nameless negative like "2.20-" against an item code is the line above's discount
      if (!worded && amt < 0 && out.items.length) {
        out.items.push({ name: "discount on " + out.items[out.items.length - 1].name, price: amt });
        return;
      }
      if (!name || name.length < 2 || !worded) return; // pure digits/symbols = not an item
      if (/^\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?$/.test(name)) return; // a date

      out.items.push({ name: name, price: amt });
    });

    // a receipt often prints TAX and TOTAL TAX with the same figure; count it once
    if (totalTax !== null) {
      out.tax = totalTax;
    } else if (taxSeen.length) {
      var uniq = [];
      taxSeen.forEach(function (v) {
        if (uniq.indexOf(v) === -1) uniq.push(v);
      });
      out.tax = uniq.reduce(function (a, b) {
        return a + b;
      }, 0);
    }

    // merchant guess: the first real line of text; store names sit above the address
    var best = "";
    for (var hi = 0; hi < header.length; hi++) {
      var h = header[hi];
      var letters = (h.match(/[A-Za-z]/g) || []).length;
      if (
        letters >= 4 &&
        h.length <= 34 &&
        !MONEY_END.test(h) &&
        !/\b(street|st|ave|avenue|road|rd|blvd|suite|ste|[A-Z]{2}\s*\d{5})\b/i.test(h) &&
        !/\d{3}[-.\s]\d{4}/.test(h)
      ) {
        best = h;
        break;
      }
    }
    out.place = best ? pretty(best) : "";
    return out;
  }

  /* ============================================================
     image handling + scanning engines
     ============================================================ */
  function readFile(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        res(fr.result);
      };
      fr.onerror = function () {
        rej(new Error("could not read that file"));
      };
      fr.readAsDataURL(file);
    });
  }
  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        res(img);
      };
      img.onerror = function () {
        rej(new Error("that file is not an image we can open"));
      };
      img.src = src;
    });
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = res;
      s.onerror = function () {
        rej(new Error("could not load the OCR library, check your connection"));
      };
      document.head.appendChild(s);
    });
  }

  // grayscale + upscale + contrast stretch: cheap, and it moves the needle a lot on receipt tape
  function preprocess(img, maxEdge) {
    var w0 = img.naturalWidth || img.width,
      h0 = img.naturalHeight || img.height;
    var scale = Math.min(2.5, Math.max(0.4, (maxEdge || 1600) / Math.max(1, w0)));
    if (w0 * h0 * scale * scale > 4.5e6) scale = Math.sqrt(4.5e6 / (w0 * h0));
    var w = Math.max(1, Math.round(w0 * scale)),
      h = Math.max(1, Math.round(h0 * scale));

    var c = el("canvas");
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    var d, a;
    try {
      d = ctx.getImageData(0, 0, w, h);
      a = d.data;
    } catch {
      return c;
    }

    var hist = new Uint32Array(256),
      g = new Uint8ClampedArray(w * h),
      i,
      j;
    for (i = 0, j = 0; i < a.length; i += 4, j++) {
      var v = (a[i] * 0.299 + a[i + 1] * 0.587 + a[i + 2] * 0.114) | 0;
      g[j] = v;
      hist[v]++;
    }
    var total = w * h,
      lo = 0,
      hi = 255,
      acc = 0,
      k;
    for (k = 0; k < 256; k++) {
      acc += hist[k];
      if (acc > total * 0.02) {
        lo = k;
        break;
      }
    }
    acc = 0;
    for (k = 255; k >= 0; k--) {
      acc += hist[k];
      if (acc > total * 0.02) {
        hi = k;
        break;
      }
    }
    var range = Math.max(1, hi - lo);
    for (i = 0, j = 0; i < a.length; i += 4, j++) {
      var n = ((g[j] - lo) * 255) / range;
      n = n < 0 ? 0 : n > 255 ? 255 : n;
      a[i] = a[i + 1] = a[i + 2] = n;
      a[i + 3] = 255;
    }
    ctx.putImageData(d, 0, 0);
    return c;
  }

  var TESS = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1";
  function runTesseract(canvas, onStep) {
    return Promise.resolve()
      .then(function () {
        return window.Tesseract ? null : loadScript(TESS + "/dist/tesseract.min.js");
      })
      .then(function () {
        onStep(0.1, "loading the language model");
        return Tesseract.createWorker("eng", 1, {
          workerPath: TESS + "/dist/worker.min.js",
          corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1",
          langPath: "https://tessdata.projectnaptha.com/4.0.0",
          logger: function (m) {
            if (m.status === "recognizing text")
              onStep(0.35 + m.progress * 0.6, "reading the receipt");
            else if (/loading|initial/i.test(m.status || "")) onStep(0.15, "starting up");
          },
        });
      })
      .then(function (worker) {
        onStep(0.32, "reading the receipt");
        return worker
          .setParameters({ tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" })
          .then(function () {
            return worker.recognize(canvas);
          })
          .then(
            function (res) {
              return worker.terminate().then(function () {
                return res.data.text;
              });
            },
            function (err) {
              return worker.terminate().then(function () {
                throw err;
              });
            },
          );
      });
  }

  function geminiOn() {
    return true;
  }

  function quotaToday() {
    var today = new Date().toISOString().slice(0, 10),
      q = { date: today, used: 0 };
    try {
      var raw = JSON.parse(localStorage.getItem("dt.split.v1.quota") || "null");
      if (raw && raw.date === today) q = raw;
    } catch {}
    return q;
  }
  function quotaLeft() {
    return Math.max(0, SHARED_DAILY_LIMIT - quotaToday().used);
  }
  function quotaSpend() {
    var q = quotaToday();
    q.used += 1;
    try {
      localStorage.setItem("dt.split.v1.quota", JSON.stringify(q));
    } catch {}
  }

  function runGemini(dataUrl, onStep) {
    var m = String(dataUrl).match(/^data:(image\/[a-zA-Z+]+);base64,([\s\S]*)$/);
    if (!m) return Promise.reject(new Error("could not encode the image"));
    onStep(0.35, "reading the receipt");
    quotaSpend();

    return fetch("/api/split/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
    }).then(function (r) {
      return r.text().then(function (body) {
        if (!r.ok) {
          var detail = body;
          try {
            detail = JSON.parse(body).error.message;
          } catch {}
          throw new Error("API " + r.status + ": " + String(detail).slice(0, 180));
        }
        var j = JSON.parse(body);
        onStep(0.9, "reading the lines");
        var cand = (j.candidates || [])[0];
        if (!cand) throw new Error("the model returned nothing, it may have blocked the image");
        return ((cand.content && cand.content.parts) || [])
          .map(function (part) {
            return part.text || "";
          })
          .join("");
      });
    });
  }

  function parseLLMJson(txt) {
    var s = String(txt)
      .replace(/```[a-z]*\s*/gi, "")
      .replace(/```/g, "")
      .trim();
    var a = s.indexOf("{"),
      b = s.lastIndexOf("}");
    if (a > -1 && b > a) s = s.slice(a, b + 1);
    var j = JSON.parse(s);
    return {
      place: j.place || "",
      items: (j.items || [])
        .filter(function (it) {
          return it && it.name && isFinite(parseFloat(it.price));
        })
        .map(function (it) {
          return { name: pretty(String(it.name)), price: parseFloat(it.price) };
        }),
      tax: isFinite(parseFloat(j.tax)) ? parseFloat(j.tax) : null,
      fees: isFinite(parseFloat(j.fees)) ? parseFloat(j.fees) : null,
      tip: isFinite(parseFloat(j.tip)) ? parseFloat(j.tip) : null,
      total: isFinite(parseFloat(j.total)) ? parseFloat(j.total) : null,
    };
  }

  /* ============================================================
     scan orchestration
     ============================================================ */
  var scanning = false;

  function setProgress(frac, msg) {
    $("#progress").hidden = false;
    $("#progress-bar").style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
    $("#progress-msg").textContent = msg;
  }
  function hideProgress() {
    $("#progress").hidden = true;
    $("#progress-bar").style.width = "0";
  }

  function showScanError(msg) {
    var b = $("#scan-error");
    b.innerHTML =
      "<b>Scan failed.</b> " +
      esc(msg) +
      "<br>Your photo is still attached, so you can press <b>Type it in</b> and read it off that.";
    b.classList.add("show");
  }

  function handleFile(file) {
    if (scanning) return;
    if (!file || !file.type.startsWith("image/")) {
      toast("that needs to be an image");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast("Please choose an image under 20 MB");
      return;
    }
    scanning = true;

    // Gemini when it is configured and there are scans left, otherwise built-in OCR
    var useGemini = geminiOn() && quotaLeft() > 0;
    if (geminiOn() && !useGemini) toast("out of free scans today, using built-in OCR");
    $("#scan-error").classList.remove("show");
    setProgress(0.05, "opening the photo");

    readFile(file)
      .then(loadImage)
      .then(function (img) {
        // a compact copy for the on-page thumbnail / lightbox
        var view = preprocess(img, 1100);
        state.image = view.toDataURL("image/jpeg", 0.72);

        if (!useGemini) {
          return runTesseract(preprocess(img, 1600), setProgress).then(function (text) {
            return parseReceipt(text);
          });
        }
        var send = el("canvas");
        var s = Math.min(1, 1800 / Math.max(1, img.naturalWidth, img.naturalHeight));
        send.width = Math.round(img.naturalWidth * s);
        send.height = Math.round(img.naturalHeight * s);
        send.getContext("2d").drawImage(img, 0, 0, send.width, send.height);
        return runGemini(send.toDataURL("image/jpeg", 0.85), setProgress)
          .then(parseLLMJson)
          .catch(function () {
            setProgress(0.4, "AI scan unavailable; reading in your browser");
            return runTesseract(preprocess(img, 1600), setProgress).then(parseReceipt);
          });
      })
      .then(function (parsed) {
        applyParsed(parsed);
        hideProgress();
        scanning = false;
        var n = parsed.items.length;
        toast(
          n ? "found " + n + " line" + (n === 1 ? "" : "s") : "no lines found, add them by hand",
        );
        goTo("items");
      })
      .catch(function (err) {
        scanning = false;
        hideProgress();
        console.error(err);
        // Keep the draft available when both scan engines fail.
        showScanError(err && err.message ? err.message : "something went wrong, try again");
        save();
      });
  }

  function applyParsed(p) {
    state.items = (p.items || []).map(function (it) {
      return newItem(it.name, it.price);
    });
    if (!state.items.length) state.items.push(newItem());
    if (p.tax != null && p.tax !== 0) state.tax = Math.abs(p.tax).toFixed(2);
    if (p.fees != null && p.fees !== 0) state.fees = Math.abs(p.fees).toFixed(2);
    if (p.tip != null && p.tip !== 0) {
      state.tip = Math.abs(p.tip).toFixed(2);
      state.tipMode = "amt";
    }
    state.expectedTotal = p.total != null && p.total !== 0 ? p.total : null;
    state.expectedSubtotal = p.subtotal != null && p.subtotal !== 0 ? p.subtotal : null;
    if (p.place && !state.place) state.place = p.place;
    if (!state.when) state.when = todayLabel();
    save();
    restoreInputs();
    renderItems();
    renderTallies();
  }

  /* ============================================================
     navigation + wiring
     ============================================================ */
  function goTo(step) {
    if (step === "items" && !state.items.length) state.items.push(newItem());
    if (step === "results" && !state.items.length) step = "items";
    if (step !== "people") rememberNames();

    state.step = step;
    save();
    $$(".screen").forEach(function (s) {
      s.classList.remove("active");
    });
    var scr = $("#screen-" + step);
    if (scr) scr.classList.add("active");
    $$(".rail button").forEach(function (b) {
      b.setAttribute("aria-current", b.dataset.goto === step ? "true" : "false");
    });

    document.querySelector(".split-app").classList.toggle("compact", step !== "people");
    if (step === "items") {
      restoreInputs();
      renderItems();
      renderTallies();
      showThumb();
    }
    if (step === "results") renderResults();
    syncBar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showThumb() {
    var row = $("#thumb-row"),
      head = $("#items-head");
    if (state.image) {
      $("#thumb-img").src = state.image;
      row.hidden = false;
      head.hidden = true;
    } else {
      row.hidden = true;
      head.hidden = false;
    }
  }

  function syncBar() {
    var r = compute();
    var info = $("#actionbar-info"),
      btn = $("#actionbar-btn");
    $("#actionbar").classList.add("show");

    if (state.step === "people") {
      var n = state.people.length;
      info.innerHTML = "<b>" + n + "</b> " + (n === 1 ? "person" : "people") + " splitting";
      btn.textContent = state.items.length ? "back to the items →" : "enter items →";
      btn.disabled = n < 1;
    } else if (state.step === "items") {
      info.innerHTML =
        "<b>" +
        money(r.grand) +
        "</b> total · " +
        state.items.length +
        " line" +
        (state.items.length === 1 ? "" : "s");
      btn.textContent = "see the split →";
      btn.disabled = !state.people.length;
    } else {
      info.innerHTML = "<b>" + money(r.grand) + "</b> split " + state.people.length + " ways";
      btn.textContent = "copy by person";
      btn.disabled = false;
    }
  }

  function restoreInputs() {
    $("#tax").value = state.tax;
    $("#fees").value = state.fees;
    $("#tip").value = state.tip;
    $("#place").value = state.place;
    $("#when").value = state.when;
    $$("#tip-mode button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.mode === state.tipMode ? "true" : "false");
    });
  }

  function bindNum(id, key) {
    $("#" + id).addEventListener("input", function () {
      state[key] = this.value;
      save();
      renderTallies();
      syncBar();
    });
  }

  function addItemAndFocus() {
    state.items.push(newItem());
    save();
    renderItems();
    renderTallies();
    syncBar();
    var rows = $$(".item .nm");
    if (rows.length) rows[rows.length - 1].focus();
  }

  function wire() {
    $("#add-person").onclick = function () {
      addPerson("");
    };

    [
      ["#drop-camera", "#file-camera"],
      ["#drop-upload", "#file-upload"],
    ].forEach(function (pair) {
      var tile = $(pair[0]),
        input = $(pair[1]);
      tile.onclick = function () {
        input.click();
      };
      tile.onkeydown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      };
      input.onchange = function () {
        if (this.files && this.files[0]) handleFile(this.files[0]);
        this.value = "";
      };
    });
    $("#drop-manual").onclick = function () {
      goTo("items");
    };
    $("#drop-manual").onkeydown = function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goTo("items");
      }
    };

    ["dragenter", "dragover"].forEach(function (ev) {
      $("#drop-upload").addEventListener(ev, function (e) {
        e.preventDefault();
        this.classList.add("over");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      $("#drop-upload").addEventListener(ev, function (e) {
        e.preventDefault();
        this.classList.remove("over");
      });
    });
    $("#drop-upload").addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    document.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    document.addEventListener("drop", function (e) {
      e.preventDefault();
      if (state.step === "people" && e.dataTransfer && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
    document.addEventListener("paste", function (e) {
      if (state.step !== "people" || !e.clipboardData) return;
      var items = e.clipboardData.items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          handleFile(items[i].getAsFile());
          return;
        }
      }
    });

    $("#add-item").onclick = addItemAndFocus;
    $("#add-item-2").onclick = addItemAndFocus;
    $("#assign-all").onclick = function () {
      var ids = state.people.map(function (p) {
        return p.id;
      });
      state.items.forEach(function (it) {
        it.assignees = ids.slice();
      });
      save();
      renderItems();
      renderTallies();
      syncBar();
      toast("everyone is on every line");
    };
    $("#only-me").onclick = function () {
      if (!state.people.length) return;
      var me = state.people[0].id;
      state.items.forEach(function (it) {
        it.assignees = [me];
      });
      save();
      renderItems();
      renderTallies();
      syncBar();
      toast("cleared, now tap people onto their lines");
    };

    bindNum("tax", "tax");
    bindNum("fees", "fees");
    bindNum("tip", "tip");
    ["place", "when"].forEach(function (k) {
      $("#" + k).addEventListener("input", function () {
        state[k] = this.value;
        save();
      });
    });
    $$("#tip-mode button").forEach(function (b) {
      b.onclick = function () {
        state.tipMode = b.dataset.mode;
        save();
        restoreInputs();
        renderTallies();
        syncBar();
      };
    });

    $$(".rail button").forEach(function (b) {
      b.onclick = function () {
        var to = b.dataset.goto;
        if (to !== "people" && !state.people.length) {
          toast("add at least one person first");
          return;
        }
        goTo(to);
      };
    });

    $("#actionbar-btn").onclick = function () {
      if (state.step === "people") goTo("items");
      else if (state.step === "items") goTo("results");
      else copyText(byPersonText(compute()), null);
    };

    $("#copy-all").onclick = function () {
      copyText(allText(compute()), $("#copy-all"));
    };
    $("#copy-by-person").onclick = function () {
      copyText(byPersonText(compute()), $("#copy-by-person"));
    };
    $("#expand-all").onclick = function () {
      var cards = $$("#shares .share");
      var anyClosed = cards.some(function (c) {
        return !c.classList.contains("open");
      });
      cards.forEach(function (c) {
        c.classList.toggle("open", anyClosed);
      });
      $("#expand-all").textContent = anyClosed ? "hide the lines" : "show every line";
    };
    $("#back-edit").onclick = function () {
      goTo("items");
    };

    $("#thumb").onclick = function () {
      $("#lightbox-img").src = state.image || "";
      $("#lightbox").classList.add("open");
    };
    $("#lightbox").onclick = function () {
      this.classList.remove("open");
    };
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") $("#lightbox").classList.remove("open");
    });

    $("#reset-all").onclick = function (e) {
      e.preventDefault();
      if (!confirm("Clear this receipt and start over? Saved names are kept.")) return;
      try {
        localStorage.removeItem(LS.state);
      } catch {}
      location.reload();
    };

    var toggle = $("#theme-toggle");
    function paintToggle() {
      var t = document.documentElement.getAttribute("data-theme");
      toggle.textContent = "day / night";
      toggle.setAttribute(
        "aria-label",
        t === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
    }
    toggle.onclick = function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      paintToggle();
    };
    paintToggle();
  }

  /* ============================================================
     boot
     ============================================================ */
  function init() {
    var restored = load();
    if (!state.people.length) {
      state.people.push(newPerson("Me"));
      state.people.push(newPerson(""));
    }
    state.people.forEach(function (p, i) {
      if (!p.color) p.color = PALETTE[i % PALETTE.length];
    });

    wire();
    renderPeople();
    renderItems();
    renderTallies();
    restoreInputs();

    var start = restored && state.step ? state.step : "people";
    if (start !== "people" && !state.items.length) start = "people";
    goTo(start);
    if (restored && state.items.length) toast("restored your last receipt");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
