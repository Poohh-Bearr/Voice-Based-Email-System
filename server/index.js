import "dotenv/config";
import crypto from "node:crypto";
import express from "express";
import session from "express-session";
import * as store from "./store.js";

const app = express();
const port = process.env.PORT || 8080;

let secret = process.env.SESSION_SECRET;
if (!secret) {
  if (process.env.NODE_ENV === "production") {
    console.error("SESSION_SECRET is required in production.");
    process.exit(1);
  }
  secret = crypto.randomBytes(32).toString("hex");
  console.warn("SESSION_SECRET not set: using a temporary secret (sessions reset on restart).");
}

app.use(express.json());
app.use(session({ secret, resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: "lax" } }));

// Wraps a handler: returns its result as JSON and turns thrown errors into JSON errors.
const route = (fn) => (req, res) => {
  try {
    res.json(fn(req) ?? { ok: true });
  } catch (e) {
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ error: e.status ? e.message : "Something went wrong." });
  }
};
const authed = (req) => {
  if (!req.session.address) throw store.fail(401, "Please log in.");
  return req.session.address;
};

app.post("/api/auth/sign_in", route((req) => {
  const user = store.createUser(req.body || {});
  req.session.address = user.address;
  return { user };
}));
app.post("/api/auth/login", route((req) => {
  const user = store.login(req.body || {});
  req.session.address = user.address;
  return { user };
}));
app.post("/api/auth/logout", route((req) => { req.session.destroy(); }));
app.get("/api/auth/fetch_user", route((req) => ({ user: store.getUser(authed(req)) })));
app.post("/api/auth/delete_user", route((req) => { store.deleteUser(authed(req)); req.session.destroy(); }));
app.post("/api/email/send_email", route((req) => ({ email: store.sendEmail({ ...req.body, from: authed(req) }) })));
app.get("/api/email/fetch_emails", route((req) => ({ emails: store.fetchEmails(authed(req)) })));

app.listen(port, () => console.log(`Server listening on port ${port}`));
