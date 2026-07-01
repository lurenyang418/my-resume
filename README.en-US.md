<div align="center">

# ✨ MyResume ✨

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF)
![React](https://img.shields.io/badge/React-19-58C4DC)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)

[简体中文](./README.md) | English

</div>

MyResume is a modern online resume editor that makes creating professional resumes simple and enjoyable. Built with Vite and React, it supports real-time preview, custom themes, and AI assistance.

## 📸 Screenshots

![782shots_so](https://github.com/user-attachments/assets/dda52f82-10eb-4f8d-a643-a11c3c4da35f)

## ✨ Features

- 🚀 Built with Vite 8 + React 19
- 🤖 AI-powered grammar check and content polish
- 🎨 Multiple resume templates
- 🌙 Dark mode
- 📤 Export to PDF
- 🔄 Real-time preview
- 💾 Local storage (File System Access API)
- 🌍 Bilingual (Chinese & English)

## 🛠️ Tech Stack

- Vite 8 + React 19
- TypeScript 6
- Tailwind CSS 4 + shadcn/ui
- Tiptap 3 Rich Text Editor
- Zustand State Management
- framer-motion Animations
- Cloudflare Workers (API)

## 🚀 Quick Start

1. Install dependencies

```bash
pnpm install
```

3. Start development server (frontend + API)

```bash
pnpm dev
```

4. Open browser and visit `http://localhost:5173`

## 📦 Build

```bash
pnpm build
```

Output:
- `dist/client/` — Frontend static assets
- `dist/cv/` — Worker API code

## ☁️ Deploy

Deploy frontend and API together with a single command:

```bash
pnpm deploy
```

Uses **Workers + Assets** model — both frontend and API are served under the same domain.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🌟 Support

If you find this project helpful, please give it a star ⭐️
