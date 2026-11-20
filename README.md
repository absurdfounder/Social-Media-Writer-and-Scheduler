# Big Mouth

Big Mouth is a social writing app for drafting tweets, threads, replies, and other social posts. This repository contains the original Next.js app and a standalone Chrome extension.

## Chrome extension

The extension lives in `extension/` and uses OpenRouter directly. It does not need the Next.js server to run.

1. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
2. Choose **Load unpacked** and select this repository's `extension/` folder.
3. Open Big Mouth from the extensions toolbar, choose the settings button, and add your OpenRouter API key. The default model is `openrouter/auto`; enter another OpenRouter model ID to use a specific model.
4. Choose a format, enter the context, and generate. You can edit each draft and copy one post or the full thread.

You can also select text on a page, right-click it, and choose **Use selection in Big Mouth**. The selected text is placed in the composer the next time you open the extension.

The extension keeps its key in Chrome's local extension storage and sends generation requests directly to OpenRouter. Model usage is billed by OpenRouter according to the selected model.

## Original Next.js app

To run the original web app locally:

1. Install dependencies with `npm install`.
2. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

The web writer supports OpenRouter from the API Keys settings. Choose OpenRouter or Anthropic in the writer and set an OpenRouter model ID. The OpenRouter server route accepts a user key or reads `OPENROUTER_API_KEY` from the server environment. Anthropic routes use `ANTHROPIC_API_KEY` when no request key is supplied.

## Notes

- Do not commit `.env` files or API keys. Use `.env.example` for placeholder variable names if setup documentation is needed.
- The extension requires an OpenRouter API key from [OpenRouter](https://openrouter.ai/keys).
