const SELECTION_MENU_ID = "big-mouth-use-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: SELECTION_MENU_ID,
      title: "Use selection in Big Mouth",
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== SELECTION_MENU_ID || !info.selectionText) return;

  chrome.storage.local.set({
    pendingSelection: info.selectionText.trim(),
    pendingSelectionSavedAt: Date.now(),
  });
});
