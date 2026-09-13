// Static, trusted markup; user data is rendered by split.js.
export const markup = `
<div class="wrap">

  <header class="topbar">
    <a class="brand" href="/">DT<span>.</span></a>
    <nav>
      <a href="/">home</a>
      <a href="/#projects">projects</a>
      <a href="#" id="reset-all">reset</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">☀</button>
    </nav>
  </header>

  <section class="hero"><p class="eyebrow">SMALL THINGS, MADE TO BE USEFUL</p>
    <h1>Split a receipt<span class="slash">.</span></h1>
    <p>Dinner with friends. Groceries with roommates. Everyone pays their share.</p><p class="privacy">Photo scans are sent to Google Gemini for reading. Your split is saved in this browser. Review scanned prices before sharing.</p>
  </section>

  <nav class="rail" aria-label="Steps">
    <button type="button" data-goto="people" aria-current="true">1 who</button>
    <button type="button" data-goto="items">2 items</button>
    <button type="button" data-goto="results">3 split</button>
  </nav>

  <!-- ================= SCREEN 1: PEOPLE + CAPTURE ================= -->
  <section class="screen active" id="screen-people">
    <div class="panel">
      <h2>Who's splitting</h2>
      <p class="hint">Add everyone. You can take people off individual lines later.</p>
      <div class="people-grid" id="people-grid"></div>
      <button class="btn sm" type="button" id="add-person">+ add person</button>
      <div class="recents" id="recents" hidden>
        <span class="lbl">recent:</span>
      </div>
    </div>

    <div class="panel">
      <h2>The receipt</h2>
      <p class="hint">Every line stays editable after the scan.</p>
      <div class="capture-row">
        <div class="drop" id="drop-camera" role="button" tabindex="0">
          <span class="big">▣</span>
          <div class="t">Take a photo</div>
          <div class="s">uses your camera</div>
        </div>
        <div class="drop" id="drop-upload" role="button" tabindex="0">
          <span class="big">↥</span>
          <div class="t">Upload an image</div>
          <div class="s">from your photos or files</div>
        </div>
        <div class="drop" id="drop-manual" role="button" tabindex="0">
          <span class="big">✎</span>
          <div class="t">Type it in</div>
          <div class="s">enter items by hand</div>
        </div>
      </div>
      <input type="file" id="file-camera" accept="image/*" capture="environment" class="sr" />
      <input type="file" id="file-upload" accept="image/*" class="sr" />

      <div class="banner" id="scan-error" role="alert" style="margin-top:12px"></div>

      <div class="progress" id="progress" hidden>
        <div class="msg" id="progress-msg">starting</div>
        <div class="bar"><i id="progress-bar"></i></div>
      </div>

    </div>
  </section>

  <!-- ================= SCREEN 2: ITEMS ================= -->
  <section class="screen" id="screen-items">
    <div class="banner" id="unassigned-banner"></div>

    <div class="panel">
      <div class="thumb-row" id="thumb-row" hidden>
        <div class="thumb" id="thumb"><img id="thumb-img" alt="Scanned receipt" /></div>
        <div>
          <h2 style="margin-bottom:4px">Check the lines</h2>
          <p class="hint" style="margin:0">Tap the photo to enlarge. Fix anything the scan got wrong.</p>
        </div>
      </div>
      <div id="items-head">
        <h2>The lines</h2>
        <p class="hint">Tap a name to take someone off a line. Use <b>&minus;</b> and <b>+</b> to
           change how many ways it splits.</p>
      </div>

      <div class="items-toolbar">
        <button class="btn sm" type="button" id="assign-all">everyone on everything</button>
        <button class="btn sm ghost" type="button" id="only-me">just me on everything</button>
        <span class="spacer"></span>
        <button class="btn sm" type="button" id="add-item">+ line</button>
      </div>

      <div id="items-list"></div>
      <button class="btn wide ghost" type="button" id="add-item-2" style="margin-top:4px">+ add another line</button>
    </div>

    <div class="panel">
      <h2>Tax, tip &amp; fees</h2>
      <p class="hint">Split in proportion to each person's items.</p>
      <div class="extras">
        <div>
          <label class="field" for="tax">tax</label>
          <input type="number" inputmode="decimal" step="0.01" id="tax" placeholder="0.00" />
        </div>
        <div>
          <label class="field" for="fees">fees / delivery</label>
          <input type="number" inputmode="decimal" step="0.01" id="fees" placeholder="0.00" />
        </div>
        <div>
          <label class="field" for="tip">tip</label>
          <input type="number" inputmode="decimal" step="0.01" id="tip" placeholder="0" />
          <div class="seg" id="tip-mode">
            <button type="button" data-mode="pct" aria-pressed="true">%</button>
            <button type="button" data-mode="amt" aria-pressed="false">$</button>
          </div>
        </div>
      </div>
      <div class="row2" style="margin-top:14px">
        <div>
          <label class="field" for="place">where (optional)</label>
          <input type="text" id="place" placeholder="Trader Joe's" />
        </div>
        <div>
          <label class="field" for="when">when</label>
          <input type="text" id="when" placeholder="today" />
        </div>
      </div>
      <div class="recon" id="recon" hidden></div>
      <div class="tallies" id="tallies"></div>
    </div>
  </section>

  <!-- ================= SCREEN 3: RESULTS ================= -->
  <section class="screen" id="screen-results">
    <div id="receipt-out">
      <div class="receipt-head">
        <div class="place" id="out-place">Receipt</div>
        <div class="when" id="out-when"></div>
        <div class="grand" id="out-grand">$0.00</div>
        <div class="sub" id="out-sub"></div>
      </div>
      <div class="zig"></div>
      <div id="shares"></div>
      <div class="res-foot">Split · Denys Tsinyk</div>
    </div>

    <div class="items-toolbar" style="margin-top:16px">
      <button class="btn" type="button" id="copy-by-person">copy by person</button>
      <button class="btn ghost" type="button" id="copy-all">copy totals</button>
      <button class="btn ghost" type="button" id="expand-all">show every line</button>
      <span class="spacer"></span>
      <button class="btn ghost" type="button" id="back-edit">← edit</button>
    </div>
    <p class="note" style="margin-top:10px">
      Screenshot this card, or copy it as text. <b>copy by person</b> lists everyone with their
      own lines under them, <b>copy totals</b> is just names and amounts, and <b>&#10697;</b> on a
      row copies that one person.
    </p>
  </section>

<p class="credit">Built on <a href="https://github.com/codingshreyash/codingshreyash.github.io/blob/main/split/index.html">Shreyash Ranjan’s receipt splitter</a>.</p>
</div>

<div class="actionbar" id="actionbar">
  <div class="info" id="actionbar-info"></div>
  <button class="btn primary" type="button" id="actionbar-btn">continue →</button>
</div>

<div class="lightbox" id="lightbox"><img id="lightbox-img" alt="Receipt full size" /></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

`;
