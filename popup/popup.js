const modeToggle = document.getElementById("mode-toggle");
const modeText = document.getElementById("mode-text");
const openAIKeyInput = document.getElementById("openai-key");
const pouchVideoInterestInput = document.getElementById("pouch-video-interest");

function setMode(mode) {
  modeToggle.classList.remove("chill", "focus");
  modeToggle.classList.add(mode);
  modeText.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  chrome.storage.sync.set({ mode });
  sendMessageToContentScript(mode);
}

function sendMessageToContentScript(mode) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const openAIKey = openAIKeyInput.value;
    const pouchVideoInterest = pouchVideoInterestInput.value;
    localStorage.setItem("openAIKey", openAIKey);
    localStorage.setItem("pouchVideoInterest", pouchVideoInterest);

    chrome.tabs.sendMessage(tabs[0].id, {
      mode,
      openAIKey,
      pouchVideoInterest,
    });
  });
}

function getMode() {
  chrome.storage.sync.get("mode", ({ mode }) => {
    if (mode === "focus") {
      setMode("focus");
    } else {
      setMode("chill");
    }
  });

  openAIKeyInput.value = localStorage.getItem("openAIKey") || "";
  pouchVideoInterestInput.value =
    localStorage.getItem("pouchVideoInterest") || "";
}

modeToggle.addEventListener("click", () => {
  if (modeToggle.classList.contains("chill")) {
    setMode("focus");
  } else {
    setMode("chill");
  }
});

getMode();
