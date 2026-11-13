// Thin wrappers around the browser's Web Speech API (works best in Chrome and Edge).
export function speak(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function listen() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error("Speech recognition is not supported in this browser. Use Chrome or Edge."));
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => resolve(e.results[0][0].transcript);
    rec.onerror = (e) => reject(new Error(`Could not hear you (${e.error}).`));
    rec.onend = () => resolve("");
    rec.start();
  });
}

// "ann at example dot com" -> "ann@example.com"
export const spokenToAddress = (t) =>
  t.toLowerCase().replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".").replace(/\s+/g, "").replace(/\.$/, "");
