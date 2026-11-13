import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const FILE = process.env.DB_FILE || path.resolve("data/db.json");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const norm = (a) => String(a || "").trim().toLowerCase();

export const fail = (status, message) => Object.assign(new Error(message), { status });

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch { return { users: [], emails: [] }; }
}
function save(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}
export function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  const expected = Buffer.from(hash || "", "hex");
  const actual = crypto.scryptSync(password, salt || "", 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const publicUser = (u) => ({ username: u.username, address: u.address });

export function createUser({ username, password, address }) {
  const name = String(username || "").trim();
  const addr = norm(address);
  if (!name) throw fail(400, "Enter a username.");
  if (!EMAIL.test(addr)) throw fail(400, "Enter a valid email address.");
  if (String(password || "").length < 8) throw fail(400, "Password must be at least 8 characters.");
  const db = load();
  if (db.users.some((u) => u.address === addr)) throw fail(409, "That address is already registered.");
  const user = { username: name, address: addr, password: hashPassword(password) };
  db.users.push(user);
  save(db);
  return publicUser(user);
}

export function login({ address, password }) {
  const user = load().users.find((u) => u.address === norm(address));
  if (!user || !checkPassword(String(password || ""), user.password)) throw fail(401, "Wrong address or password.");
  return publicUser(user);
}

export function getUser(address) {
  const user = load().users.find((u) => u.address === address);
  if (!user) throw fail(401, "Please log in.");
  return publicUser(user);
}

export function deleteUser(address) {
  const db = load();
  db.users = db.users.filter((u) => u.address !== address);
  save(db);
}

export function sendEmail({ from, to, subject, content }) {
  const recipient = norm(to);
  const db = load();
  if (!db.users.some((u) => u.address === recipient)) throw fail(404, "No user has that address.");
  if (!String(content || "").trim()) throw fail(400, "The message is empty.");
  const email = {
    id: crypto.randomUUID(),
    from,
    to: recipient,
    subject: String(subject || "").trim() || "(no subject)",
    content: String(content).trim(),
    sentAt: new Date().toISOString(),
  };
  db.emails.push(email);
  save(db);
  return email;
}

export const fetchEmails = (address) =>
  load().emails.filter((e) => e.to === address).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
