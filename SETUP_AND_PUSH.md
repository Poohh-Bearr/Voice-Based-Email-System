# Setup and push to GitHub: step by step

## Part A. Run it on your computer
1. Unzip `voice-based-email-system.zip` and open the folder in a terminal. On a Mac, press Cmd+Shift+. in Finder to see hidden files like `.gitignore`.
2. Check Node: `node -v` should print v18 or higher.
3. Install: `npm install`
4. Run the tests: `npm test`. All tests should pass. If one fails, copy the output and ask for help before continuing.
5. Start the app: `npm run dev`. This starts the server (port 8080) and the front end (port 5173).
6. Open http://localhost:5173 in Chrome or Edge. Create an account, for example ann@example.com with a password of at least 8 characters.
7. Open a private window, create a second account (bob@example.com), and send a message between the two. Allow the microphone when the browser asks, then try the voice commands from the README.

## Part B. Put it on GitHub
8. Go to https://github.com/new. Name: `Voice-Based-Email-System`. Public. Leave README, .gitignore, and license unchecked. Click Create repository.
9. In the project folder run `git init` and `git status`. Confirm `node_modules`, `.env`, and `data` are NOT listed.
10. Commit in groups:
```bash
git add package.json package-lock.json vite.config.js index.html .gitignore .env.example
git commit -m "Scaffold Vite, React, and Express project"

git add server/store.js server/store.test.js
git commit -m "Add storage layer with password hashing and tests"

git add server/index.js
git commit -m "Add Express API with session authentication"

git add src
git commit -m "Add React interface and voice commands"

git add README.md SETUP_AND_PUSH.md
git commit -m "Add documentation"
```
11. Push:
```bash
git remote add origin https://github.com/Poohh-Bearr/Voice-Based-Email-System.git
git branch -M main
git -c credential.helper= push -u origin main
```
Username: Poohh-Bearr. Password: your personal access token (the repo scope is enough).

## Part C. After the push
12. Open the repo and check that `.env` and `data/` are not there.
13. Add a screenshot or short demo GIF to the README.
14. Read every file in `server/` and `src/` until you can explain it. Add one feature of your own (for example, delete a message, or a "reply" voice command). You will be asked about this code in interviews.
15. There is no live link: the app needs its Express server running. A demo GIF is the practical alternative.
