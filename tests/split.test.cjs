const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
// Exercise the exact browser math without a DOM or duplicated implementation.
const source = fs.readFileSync("public/split.js", "utf8");
const context = vm.createContext({ document: { querySelector() { return { dataset: {} }; }, readyState: "loading", addEventListener() {} } });
vm.runInContext(
  source.replace(
    /\}\)\(\);\s*$/,
    "globalThis.split = { distribute, compute, state, parseReceipt }; })();",
  ),
  context,
);
const { distribute, compute, state } = context.split;

test("cent allocation preserves totals for discounts, pennies, and uneven shares", () => {
  for (let total = -1001; total <= 1001; total++) {
    for (const weights of [
      [1, 1, 1],
      [0, 0],
      [0, 1, 2, 7],
    ]) {
      const shares = distribute(total, weights);
      assert.equal(
        shares.reduce((a, b) => a + b, 0),
        total,
      );
      assert.ok(shares.every(Number.isInteger));
    }
  }
});
test("assignments, discounts and proportional extras reconcile to the receipt", () => {
  Object.assign(state, {
    people: [{ id: "a" }, { id: "b" }],
    items: [
      { name: "Dinner", price: "20.01", assignees: ["a", "b"] },
      { name: "Drink", price: "10.00", assignees: ["a"] },
      { name: "Coupon", price: "-2.00", assignees: ["a"] },
    ],
    tax: "2.80",
    fees: "1.00",
    tip: "10",
    tipMode: "pct",
  });
  const result = compute();
  assert.equal(result.grand, 3461);
  assert.equal(result.owed.a + result.owed.b, result.grand);
  assert.equal(result.owed.a, 2225);
  assert.equal(result.owed.b, 1236);
});
test("unassigned items remain visible as a discrepancy", () => {
  state.items.push({ name: "Unassigned", price: "4.00", assignees: [] });
  const result = compute();
  assert.equal(result.orphanCount, 1);
  assert.equal(result.orphanCents, 400);
  assert.equal(result.grand - result.owed.a - result.owed.b, 400);
});
