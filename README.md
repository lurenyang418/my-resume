<div align="center">

# ✨ MyResume ✨

[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF)
![React](https://img.shields.io/badge/React-19-58C4DC)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)

简体中文 | [English](./README.en-US.md)

</div>

MyResume 是一个现代化的在线简历编辑器，让创建专业简历变得简单有趣。基于 Vite 和 React 构建，支持实时预览、自定义主题和 AI 辅助。

## 📸 项目截图

![782shots_so](https://github.com/user-attachments/assets/d59f7582-799c-468d-becf-59ee6453acfd)

## ✨ 特性

- 🚀 基于 Vite 8 + React 19 构建
- 🤖 AI 智能语法检查和润色
- 🎨 多套简历模板
- 🌙 深色模式
- 📤 导出为 PDF
- 🔄 实时预览
- 💾 硬盘级本地存储
- 🌍 中英文双语

## 🛠️ 技术栈

- Vite 8 + React 19
- TypeScript 6
- Tailwind CSS 4 + shadcn/ui
- Tiptap 3 富文本编辑器
- Zustand 状态管理
- framer-motion 动画
- Cloudflare Workers (API)

## 🚀 快速开始

1. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器（前端 + API）

```bash
pnpm dev
```

4. 打开浏览器访问 `http://localhost:5173`

## 📦 构建

```bash
pnpm build
```

构建产物：
- `dist/client/` — 前端静态资源
- `dist/cv/` — Worker API 代码

## ☁️ 部署

单命令部署到 Cloudflare Workers：

```bash
pnpm deploy
```

使用 **Workers + Assets** 模型，前端和后端 API 统一部署在同一域名下。

## 📝 开源协议

本项目采用 MIT 协议。查看 [LICENSE](LICENSE) 了解详情

## 🌟 支持项目

如果这个项目对你有帮助，欢迎点个 star ⭐️
