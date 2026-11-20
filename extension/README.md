# Big Mouth Chrome extension

## Install locally

1. Unzip the package if needed.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose this `extension` folder.
4. Open Big Mouth from the extensions toolbar, open settings, and enter your OpenRouter API key.

## Use

Choose Tweet, Thread, Reply, Quote post, LinkedIn, Reddit, or Hacker News. Add the context and optional voice notes, then edit and copy the generated drafts. To use text from another page, select it, right-click, choose **Use selection in Big Mouth**, and open the extension.

The default model is `openrouter/auto`; you can enter another OpenRouter model ID in settings. Model usage is billed by OpenRouter according to the selected model.

The key is stored in Chrome's local extension storage and is sent to OpenRouter only when you generate a draft. The extension uses Chrome storage, context menu, and clipboard write permissions, plus network access to `openrouter.ai`.
