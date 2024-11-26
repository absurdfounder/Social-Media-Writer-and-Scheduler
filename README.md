# Project Overview

This repository can generate AI-based tweets and threads using the Anthropic API. It includes various components and features to facilitate the creation and management of tweet threads, as well as support for image and video uploads.

# Features

- Generate AI-based tweets and threads using Anthropic API.
- Handle API requests to generate tweets with `app/api/anthropic/route.js` and `app/pages/api/anthropic.js`.
- Create and manage tweet threads with the `ThreadWriter` component in `app/dashboard_pages/MainDashboard.js`.
- Compose tweets using the `TipTapEditor` component in `app/dashboard_pages/MainDashboard.js`.
- Support for image and video uploads for tweets.
- Collect product information for personalized tweet generation with the `Commissions` component in `app/dashboard_pages/Commissions.js`.
- Use Tailwind CSS for styling, as seen in `app/globals.css` and `tailwind.config.js`.

# Installation

To get started with this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/SuperHuman12/TC_Tweets.git
   cd TC_Tweets
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

# Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
2. Use the `ThreadWriter` component to create and manage tweet threads.
3. Utilize the `TipTapEditor` component to compose tweets with rich text formatting.
4. Upload images and videos to enhance your tweets.
5. Collect product information using the `Commissions` component for personalized tweet generation.

# Contributing

We welcome contributions to improve this project. To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request to the `main` branch of the original repository.

Thank you for your contributions!
