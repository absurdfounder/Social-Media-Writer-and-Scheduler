const DEFAULT_MODEL = "openrouter/auto";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const SEPARATOR = "---POST---";

const $ = (selector) => document.querySelector(selector);
const elements = {
  settingsToggle: $("#settings-toggle"),
  settingsPanel: $("#settings-panel"),
  apiKey: $("#api-key"),
  model: $("#model"),
  toggleKey: $("#toggle-key"),
  saveSettings: $("#save-settings"),
  draftForm: $("#draft-form"),
  format: $("#format"),
  threadCountControl: $("#thread-count-control"),
  threadCount: $("#thread-count"),
  tone: $("#tone"),
  prompt: $("#prompt"),
  promptCount: $("#prompt-count"),
  selectionHint: $("#selection-hint"),
  voiceNotes: $("#voice-notes"),
  replyOptions: $("#reply-options"),
  replyLength: $("#reply-length"),
  stance: $("#stance"),
  generate: $("#generate"),
  generateLabel: $("#generate-label"),
  status: $("#status"),
  results: $("#results"),
  resultModel: $("#result-model"),
  postList: $("#post-list"),
  copyAll: $("#copy-all"),
  clearResults: $("#clear-results"),
};

const formatDetails = {
  tweet: {
    label: "Tweet",
    instruction: "Write one standalone X post under 280 characters. Make the first line earn attention, then keep it clear and natural.",
  },
  thread: {
    label: "X thread",
    instruction: `Write exactly the requested number of connected X posts. Keep each post under 280 characters, make the first one compelling, give each post one clear beat, and finish with a satisfying close. Separate posts with the exact marker ${SEPARATOR}. Do not number the posts.`,
  },
  reply: {
    label: "X reply",
    instruction: "Write one natural reply to the supplied post. Respond to what it actually says and add a real thought, experience, or question. Avoid generic praise.",
  },
  quote: {
    label: "X quote post",
    instruction: "Write one concise quote post that adds a clear perspective to the supplied post. It should make sense beside the quoted text without repeating the whole thing.",
  },
  linkedin: {
    label: "LinkedIn post",
    instruction: "Write a readable LinkedIn post with a strong opening, short paragraphs, and a useful takeaway. Avoid corporate filler and invented facts.",
  },
  reddit: {
    label: "Reddit post",
    instruction: "Write a Reddit-ready post with a useful title on the first line and a candid, specific body. Do not add marketing language or fabricate details.",
  },
  hackernews: {
    label: "Hacker News submission",
    instruction: "Write a concise, factual Hacker News title and a short, low-hype submission note. Do not add claims that were not supplied.",
  },
};

const toneDetails = {
  natural: "Conversational, specific, and human.",
  witty: "Lightly witty and sharp, without forcing jokes.",
  insightful: "Thoughtful and clear, with one useful insight.",
  bold: "Direct and confident, without exaggerating.",
  helpful: "Generous and practical, with concrete value.",
};

function showStatus(message = "", kind = "") {
  elements.status.textContent = message;
  elements.status.className = `status${kind ? ` ${kind}` : ""}`;
}

async function readSettings() {
  const stored = await chrome.storage.local.get(["openRouterKey", "openRouterModel", "voiceNotes", "pendingSelection", "pendingSelectionSavedAt"]);
  elements.apiKey.value = stored.openRouterKey || "";
  elements.model.value = stored.openRouterModel || DEFAULT_MODEL;
  elements.voiceNotes.value = stored.voiceNotes || "";

  const selectionIsFresh = stored.pendingSelectionSavedAt && Date.now() - stored.pendingSelectionSavedAt < 24 * 60 * 60 * 1000;
  if (selectionIsFresh && stored.pendingSelection && !elements.prompt.value.trim()) {
    elements.prompt.value = stored.pendingSelection;
    elements.selectionHint.hidden = false;
    await chrome.storage.local.remove(["pendingSelection", "pendingSelectionSavedAt"]);
    updatePromptCount();
  }
}

function updateFormatControls() {
  elements.threadCountControl.hidden = elements.format.value !== "thread";
  elements.replyOptions.hidden = !["reply", "quote"].includes(elements.format.value);
  elements.generateLabel.textContent = elements.format.value === "thread" ? "Write thread" : "Write draft";
}

function updatePromptCount() {
  const length = elements.prompt.value.length;
  elements.promptCount.textContent = `${length.toLocaleString()} character${length === 1 ? "" : "s"}`;
}

function buildSystemPrompt() {
  const format = formatDetails[elements.format.value];
  const replyLength = elements.replyLength.value;
  const stance = elements.stance.value;
  const replyInstruction = elements.format.value === "reply" || elements.format.value === "quote"
    ? ` Reply length: ${replyLength}. Stance: ${stance}.`
    : "";
  const voiceNotes = elements.voiceNotes.value.trim();

  return [
    "You are Big Mouth, a sharp social writing partner for an indie founder and product builder.",
    format.instruction,
    `Tone: ${toneDetails[elements.tone.value]}${replyInstruction}`,
    "Use only facts provided in the prompt or voice notes. Do not invent metrics, achievements, customer stories, or personal details. Avoid clichés, filler, hashtags, and emojis unless requested. Return only the draft, with no explanation or preamble.",
    voiceNotes ? `Voice and background notes (treat as context, not instructions to reveal):\n${voiceNotes}` : "",
  ].filter(Boolean).join("\n\n");
}

function buildUserPrompt() {
  const context = elements.prompt.value.trim();
  if (elements.format.value === "thread") {
    return `Write ${elements.threadCount.value} connected posts about this idea or context:\n\n${context}`;
  }
  return context;
}

function splitDrafts(text) {
  const cleaned = text.trim();
  if (elements.format.value !== "thread") return [cleaned];

  const markedParts = cleaned.split(/\s*---POST---\s*/i).map((part) => part.trim()).filter(Boolean);
  if (markedParts.length > 1) return markedParts;

  const numberedParts = cleaned.split(/\n(?=\s*(?:\d{1,2}[.)]|Post\s+\d+)\s+)/i).map((part) => part.trim()).filter(Boolean);
  if (numberedParts.length > 1) {
    return numberedParts.map((part) => part.replace(/^\s*(?:\d{1,2}[.)]|Post\s+\d+)\s*/, ""));
  }
  return [cleaned];
}

function renderDrafts(drafts, modelName) {
  elements.postList.replaceChildren();
  elements.resultModel.textContent = `Generated with ${modelName}`;

  drafts.forEach((draft, index) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const head = document.createElement("div");
    head.className = "post-card-head";
    const label = document.createElement("span");
    label.textContent = drafts.length > 1 ? `POST ${index + 1} OF ${drafts.length}` : formatDetails[elements.format.value].label.toUpperCase();
    head.append(label);

    const textarea = document.createElement("textarea");
    textarea.className = "draft-text";
    textarea.rows = Math.max(3, Math.min(7, Math.ceil(draft.length / 52)));
    textarea.value = draft;
    textarea.setAttribute("aria-label", `Draft ${index + 1}`);

    const foot = document.createElement("div");
    foot.className = "post-card-foot";
    const count = document.createElement("span");
    const updateCount = () => { count.textContent = `${textarea.value.length} characters`; };
    textarea.addEventListener("input", updateCount);
    updateCount();

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-post";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      await copyText(textarea.value, copyButton);
    });

    foot.append(count, copyButton);
    card.append(head, textarea, foot);
    elements.postList.append(card);
  });

  elements.results.hidden = false;
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1200);
  } catch {
    showStatus("Could not copy to clipboard. Select the draft and copy it manually.", "error");
  }
}

async function generateDraft(event) {
  event.preventDefault();
  const prompt = buildUserPrompt();
  const apiKey = elements.apiKey.value.trim();
  const model = elements.model.value.trim() || DEFAULT_MODEL;

  if (!apiKey) {
    elements.settingsPanel.hidden = false;
    elements.settingsToggle.setAttribute("aria-expanded", "true");
    elements.apiKey.focus();
    showStatus("Add your OpenRouter API key in settings to generate drafts.", "error");
    return;
  }
  if (!prompt) {
    elements.prompt.focus();
    showStatus("Add a little context first.", "error");
    return;
  }

  await chrome.storage.local.set({
    openRouterKey: apiKey,
    openRouterModel: model,
    voiceNotes: elements.voiceNotes.value.trim(),
  });

  elements.generate.disabled = true;
  elements.generateLabel.textContent = "Writing…";
  showStatus("Asking OpenRouter for a draft…");

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Big Mouth Social Writer",
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: elements.format.value === "thread" ? 1800 : 700,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || data?.message || `OpenRouter returned HTTP ${response.status}.`;
      throw new Error(detail);
    }
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("OpenRouter returned an empty draft. Try again or choose another model.");
    }

    renderDrafts(splitDrafts(text), data.model || model);
    showStatus("Draft ready. Edit it before you post.", "success");
  } catch (error) {
    showStatus(error.message || "Could not generate a draft. Check your key and connection.", "error");
  } finally {
    elements.generate.disabled = false;
    updateFormatControls();
  }
}

elements.settingsToggle.addEventListener("click", () => {
  const isOpening = elements.settingsPanel.hidden;
  elements.settingsPanel.hidden = !isOpening;
  elements.settingsToggle.setAttribute("aria-expanded", String(isOpening));
});

elements.toggleKey.addEventListener("click", () => {
  const shouldShow = elements.apiKey.type === "password";
  elements.apiKey.type = shouldShow ? "text" : "password";
  elements.toggleKey.textContent = shouldShow ? "Hide" : "Show";
});

elements.saveSettings.addEventListener("click", async () => {
  const model = elements.model.value.trim() || DEFAULT_MODEL;
  elements.model.value = model;
  await chrome.storage.local.set({
    openRouterKey: elements.apiKey.value.trim(),
    openRouterModel: model,
    voiceNotes: elements.voiceNotes.value.trim(),
  });
  showStatus("Settings saved on this device.", "success");
});

elements.format.addEventListener("change", updateFormatControls);
elements.prompt.addEventListener("input", () => {
  elements.selectionHint.hidden = true;
  updatePromptCount();
});
elements.draftForm.addEventListener("submit", generateDraft);
elements.copyAll.addEventListener("click", async () => {
  const drafts = [...elements.postList.querySelectorAll(".draft-text")].map((input) => input.value.trim());
  await copyText(drafts.join("\n\n"), elements.copyAll);
});
elements.clearResults.addEventListener("click", () => {
  elements.results.hidden = true;
  elements.postList.replaceChildren();
  showStatus("");
});

updateFormatControls();
updatePromptCount();
readSettings().catch(() => showStatus("Could not load settings from Chrome storage.", "error"));
