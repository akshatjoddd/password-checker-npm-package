import test from "node:test";
import assert from "node:assert/strict";
import { inspectPassword, getStrengthLabel } from "../src/index.js";

test("rejects values that are not strings", () => {
  assert.throws(() => inspectPassword(123456), TypeError);
  assert.throws(() => inspectPassword(null), TypeError);
});

test("returns a very weak result for an empty password", () => {
  const result = inspectPassword("");
  assert.equal(result.score, 0);
  assert.equal(result.strength, "Very Weak");
  assert.equal(result.length, 0);
});

test("detects a common password", () => {
  const result = inspectPassword("password123");
  assert.ok(result.issues.includes("This password matches a commonly used password."));
  assert.ok(result.score < 40);
});

test("detects dictionary words and sequential patterns", () => {
  const result = inspectPassword("hello123");
  assert.ok(result.issues.includes("Password contains a common word or predictable term."));
  assert.ok(result.issues.includes("Password contains a predictable sequence such as 123 or abc."));
});

test("detects repeated characters", () => {
  const result = inspectPassword("AAAAaaaa1111");
  assert.ok(result.issues.includes("Password contains repeated characters."));
});

test("detects keyboard sequences", () => {
  const result = inspectPassword("My-qwerty-Password-2026");
  assert.ok(result.issues.includes("Password contains a predictable keyboard sequence."));
});

test("reports character types without returning the password", () => {
  const password = "R4ndom!Passphrase";
  const result = inspectPassword(password);
  assert.deepEqual(result.characterTypes, {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    spaces: false
  });
  assert.equal(Object.hasOwn(result, "password"), false);
  assert.equal(JSON.stringify(result).includes(password), false);
});

test("gives a higher score to a longer, varied password than a common one", () => {
  const weak = inspectPassword("password123");
  const stronger = inspectPassword("Violet!River82-Cloud");
  assert.ok(stronger.score > weak.score);
});

test("returns a score between 0 and 100", () => {
  const result = inspectPassword("A-longer!Example-Password-9082");
  assert.ok(result.score >= 0);
  assert.ok(result.score <= 100);
});

test("maps scores to strength labels", () => {
  assert.equal(getStrengthLabel(10), "Very Weak");
  assert.equal(getStrengthLabel(30), "Weak");
  assert.equal(getStrengthLabel(50), "Fair");
  assert.equal(getStrengthLabel(70), "Strong");
  assert.equal(getStrengthLabel(90), "Very Strong");
});
