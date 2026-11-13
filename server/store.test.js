import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

let store;
beforeAll(async () => {
  process.env.DB_FILE = path.join(os.tmpdir(), `voice-email-test-${Date.now()}.json`);
  store = await import("./store.js");
});

describe("passwords", () => {
  it("accepts the right password and rejects a wrong one", () => {
    const hash = store.hashPassword("correct horse");
    expect(store.checkPassword("correct horse", hash)).toBe(true);
    expect(store.checkPassword("wrong", hash)).toBe(false);
  });
});

describe("users", () => {
  it("rejects short passwords and invalid addresses", () => {
    expect(() => store.createUser({ username: "a", password: "short", address: "a@x.io" })).toThrow(/8 characters/);
    expect(() => store.createUser({ username: "a", password: "longenough", address: "nope" })).toThrow(/valid email/);
  });
  it("rejects duplicate addresses and wrong logins", () => {
    store.createUser({ username: "Ann", password: "password1", address: "ann@x.io" });
    expect(() => store.createUser({ username: "Ann", password: "password1", address: "ANN@x.io" })).toThrow(/already/);
    expect(store.login({ address: "ann@x.io", password: "password1" }).username).toBe("Ann");
    expect(() => store.login({ address: "ann@x.io", password: "bad" })).toThrow(/Wrong/);
  });
});

describe("email", () => {
  it("delivers mail to the recipient's inbox, newest first", () => {
    store.createUser({ username: "Bob", password: "password2", address: "bob@x.io" });
    store.sendEmail({ from: "ann@x.io", to: "bob@x.io", subject: "One", content: "first" });
    store.sendEmail({ from: "ann@x.io", to: "bob@x.io", subject: "Two", content: "second" });
    const inbox = store.fetchEmails("bob@x.io");
    expect(inbox).toHaveLength(2);
    expect(store.fetchEmails("ann@x.io")).toHaveLength(0);
  });
  it("rejects unknown recipients and empty messages", () => {
    expect(() => store.sendEmail({ from: "ann@x.io", to: "ghost@x.io", content: "hi" })).toThrow(/No user/);
    expect(() => store.sendEmail({ from: "ann@x.io", to: "bob@x.io", content: "  " })).toThrow(/empty/);
  });
});
