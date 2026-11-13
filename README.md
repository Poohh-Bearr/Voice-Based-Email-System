# Voice-Based Email System for Blind People

A voice-controlled email application for visually impaired users. Users sign up, log in, and then read their inbox, open messages, and compose and send email by speaking. Spoken feedback confirms every action, and everything is also available through a keyboard-accessible form interface.

## Features

- Account sign-up, login, logout, and account deletion with server-side sessions
- Passwords hashed with scrypt and a per-user salt
- Send and receive email between registered users
- Voice commands: read the inbox, open a message by number, compose by dictation, log out, help
- Spoken playback of messages with the browser's speech synthesis
- High-contrast, keyboard-friendly interface with `aria-live` status updates

## Tech stack

React 18 and Vite (front end), Node.js and Express with express-session (back end), Web Speech API (recognition and synthesis), JSON file storage, Vitest for tests.

## Voice commands

Press **Speak a command**, wait for "Listening", then say one of:

| Say | What happens |
|---|---|
| "help" | Lists the commands |
| "read inbox" | Reads how many messages you have and the first five subjects |
| "read message 2" | Reads message 2 aloud |
| "compose" | Asks for recipient, subject, and message, then asks you to say "send" |
| "log out" | Logs you out |

When dictating an address, say "ann at example dot com".

## Run locally

Requires Node.js 18 or newer and Chrome or Edge (speech recognition support varies by browser).

```bash
npm install
npm run dev
```

Open http://localhost:5173. Optionally copy `.env.example` to `.env` and set `SESSION_SECRET`. If it is not set, a temporary secret is generated for development.

```bash
npm test    # run the tests
```

## API

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/sign_in` | `username`, `address`, `password` |
| POST | `/api/auth/login` | `address`, `password` |
| POST | `/api/auth/logout` | none |
| GET | `/api/auth/fetch_user` | none |
| POST | `/api/auth/delete_user` | none |
| POST | `/api/email/send_email` | `to`, `subject`, `content` |
| GET | `/api/email/fetch_emails` | none |

## Project structure

```text
server/index.js       Express server and routes
server/store.js       JSON storage, password hashing, user and email logic
server/store.test.js  Tests for the storage logic
src/                  React app (App, AuthForm, api and voice helpers)
```

## Limitations

Mail is delivered only between users of this app, and data is kept in a local JSON file (`data/db.json`, git-ignored). It is a learning project, not a production mail system.
