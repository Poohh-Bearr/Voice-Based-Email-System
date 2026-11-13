import { useEffect, useState } from "react";
import { api } from "./api.js";
import { speak, listen, spokenToAddress } from "./voice.js";
import AuthForm from "./AuthForm.jsx";
import "./App.css";

const NUMBERS = { one: 1, two: 2, three: 3, four: 4, five: 5 };
const EMPTY = { to: "", subject: "", content: "" };

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const say = (text) => { setStatus(text); return speak(text); };
  const refresh = async () => { const { emails } = await api.inbox(); setEmails(emails); return emails; };

  useEffect(() => {
    api.me().then(({ user }) => { setUser(user); return refresh(); }).catch(() => {}).finally(() => setReady(true));
  }, []);

  async function afterAuth(u) { setUser(u); await refresh(); await say(`Welcome ${u.username}. Press the speak button and say help for commands.`); }
  async function logout() { await api.logout(); setUser(null); setEmails([]); setStatus(""); }

  async function send(d = draft) {
    try { await api.send(d); setDraft(EMPTY); await say("Email sent."); }
    catch (e) { await say(e.message); }
  }

  const describe = (m, i) => `Message ${i + 1} from ${m.from}. Subject: ${m.subject}.`;
  async function readInbox() {
    const list = await refresh();
    if (!list.length) return say("Your inbox is empty.");
    return say(`You have ${list.length} messages. ${list.slice(0, 5).map(describe).join(" ")}`);
  }

  async function composeByVoice() {
    const ask = async (prompt) => { await say(prompt); return listen(); };
    const to = spokenToAddress(await ask("Who is the recipient?"));
    const subject = await ask("What is the subject?");
    const content = await ask("Say your message.");
    setDraft({ to, subject, content });
    await say(`Message to ${to}. Subject: ${subject}. Say send to send it, or anything else to cancel.`);
    if ((await listen()).toLowerCase().includes("send")) await send({ to, subject, content });
    else await say("Cancelled. Your draft is still on screen.");
  }

  async function runVoice() {
    setBusy(true);
    try {
      await say("Listening.");
      const heard = (await listen()).toLowerCase();
      setStatus(`Heard: "${heard}"`);
      const word = (heard.match(/\b(one|two|three|four|five)\b/) || [])[1];
      const n = Number((heard.match(/\d+/) || [])[0]) || NUMBERS[word];
      if (heard.includes("help")) await say("You can say: read inbox, read message followed by a number, compose, or log out.");
      else if (/compose|new email|write/.test(heard)) await composeByVoice();
      else if (/read|open/.test(heard) && n) {
        const m = emails[n - 1];
        await say(m ? `From ${m.from}. Subject: ${m.subject}. ${m.content}` : `There is no message ${n}.`);
      } else if (/inbox|mail|messages/.test(heard)) await readInbox();
      else if (heard.includes("log out") || heard.includes("logout")) await logout();
      else await say("Sorry, I did not catch that. Say help for commands.");
    } catch (e) { await say(e.message); }
    setBusy(false);
  }

  if (!ready) return null;
  if (!user) return <AuthForm onDone={afterAuth} />;

  return (
    <main className="app">
      <header className="bar">
        <h1>Inbox</h1>
        <span>{user.address}</span>
        <button type="button" className="link" onClick={logout}>Log out</button>
      </header>

      <button type="button" className="speak" onClick={runVoice} disabled={busy} autoFocus>
        {busy ? "Working..." : "Speak a command"}
      </button>
      <p role="status" aria-live="polite" className="status">{status}</p>

      <form className="stack" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <h2>Write an email</h2>
        <label>To<input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} /></label>
        <label>Subject<input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></label>
        <label>Message<textarea rows="4" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></label>
        <button type="submit">Send email</button>
      </form>

      <h2>Messages</h2>
      <button type="button" onClick={readInbox}>Refresh and read inbox aloud</button>
      {emails.length === 0 ? <p>No messages yet.</p> : (
        <ol className="inbox">
          {emails.map((m, i) => (
            <li key={m.id}>
              <strong>{m.subject}</strong>
              <span> from {m.from}, {new Date(m.sentAt).toLocaleString()}</span>
              <p>{m.content}</p>
              <button type="button" className="link" onClick={() => say(`From ${m.from}. Subject: ${m.subject}. ${m.content}`)}>
                Read message {i + 1} aloud
              </button>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
