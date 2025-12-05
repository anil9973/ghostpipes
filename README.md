# 👻 GhostPipes

> **Yahoo Pipes returns from the dead** — AI-powered data pipelines for the modern web

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Chrome 140+](https://img.shields.io/badge/Chrome-140%2B-green.svg)](https://www.google.com/chrome/)
[![Version](https://img.shields.io/badge/version-0.0.1-orange.svg)](https://github.com/anil9973/ghostpipes)

**GhostPipes** is a browser extension and web app that brings back the spirit of Yahoo Pipes with modern AI capabilities. Build visual data pipelines to scrape, transform, and automate web data — no coding required.

---

## ✨ Features

### 🤖 AI-Powered Pipeline Generation

- Describe what you want in plain English
- AI generates complete pipelines automatically
- Smart suggestions based on context

### 🎨 Visual Pipeline Builder

- Drag-and-drop node interface
- Real-time data preview on pipes
- Spooky dark theme with neon accents

### 🔌 Browser Extension Integration

- **Alt+E**: Select data from any webpage
- **Alt+P**: Process selected data instantly
- **Alt+B**: Build custom pipeline from selection

### 📦 Pre-built Node Types

- **Input**: HTTP requests, webhooks, manual input, extension data
- **Processing**: Filter, transform, parse, AI analysis
- **Output**: Download, email, notifications, webhooks

### ⚡ Execution Engine

- Sequential and parallel execution
- Error recovery and retry logic
- Scheduled pipeline runs
- Execution history tracking

---

## 🚀 Quick Start

### Extension Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/anil9973/ghostpipes.git
   cd ghostpipes
   ```

2. **Load extension in Chrome**

   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Start using**
   - Click the GhostPipes icon in toolbar
   - Or use keyboard shortcuts (Alt+E, Alt+P, Alt+B)

### Backend Setup (Optional)

For webhook support and cloud sync:

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

---

## 📖 Usage Examples

### Example 1: Price Tracker

**Goal**: Track Amazon product prices daily

1. Navigate to Amazon product page
2. Press **Alt+E** to enter selection mode
3. Click on price element
4. Press **Alt+P** to open pipeline menu
5. Select "Price Tracker" template
6. Set schedule to run daily
7. Done! Get notifications when price drops

### Example 2: Lead Scraper

**Goal**: Extract contact info from company websites

1. Open GhostPipes extension
2. Type: "Extract emails and phone numbers from website"
3. Paste website URL
4. Click "Build It"
5. AI generates pipeline with:
   - HTTP Request node
   - HTML Parser node
   - Filter node (emails/phones only)
   - Download CSV node

### Example 3: News Monitor

**Goal**: Get daily digest of tech news

1. Create new pipeline
2. Add RSS Feed node (TechCrunch, Hacker News, etc.)
3. Add Filter node (keywords: "AI", "startup")
4. Add Transform node (format as HTML)
5. Add Email node (send daily at 9 AM)
6. Save and schedule

---

## 🏗️ Architecture

```
ghostpipes/
├── extension/          # Chrome extension
│   ├── background/     # Service worker
│   ├── pipelines/      # Pipeline builder UI
│   ├── scripts/        # Content scripts
│   └── lib/            # Om.js framework
│
├── backend/            # Optional backend server
│   ├── src/
│   │   ├── modules/    # API modules
│   │   ├── db/         # Database layer
│   │   └── middleware/ # Auth, rate limiting
│   └── scripts/        # Migration scripts
│
└── .kiro/              # Development rules
    └── steering/       # Code patterns & guidelines
```

### Tech Stack

- **Frontend**: Vanilla JS + Om.js (reactive framework)
- **Extension**: Chrome Manifest V3
- **Backend**: Fastify + PostgreSQL
- **Storage**: IndexedDB (local) + PostgreSQL (cloud)
- **AI**: OpenAI API (configurable)

---

## 🎯 Node Types

### Input Nodes

- **Manual Input**: Paste text or upload files
- **HTTP Request**: GET/POST with headers & auth
- **Webhook**: Receive data from external services
- **Extension Data**: Selected content from webpages
- **RSS Feed**: Subscribe to RSS/Atom feeds

### Processing Nodes

- **Filter**: Permit/block items by rules
- **Transform**: Map, reduce, reshape data
- **Parse**: HTML, JSON, XML, CSV parsing
- **AI**: GPT-powered analysis & extraction
- **Merge**: Combine multiple data sources
- **Split**: Divide data into branches

### Output Nodes

- **Download**: Save as JSON, CSV, TXT
- **Email**: Send formatted emails
- **Webhook**: POST to external APIs
- **Notification**: Browser notifications
- **Storage**: Save to IndexedDB

---

## ⌨️ Keyboard Shortcuts

| Shortcut   | Action                |
| ---------- | --------------------- |
| **Alt+E**  | Enter selection mode  |
| **Alt+P**  | Process selected data |
| **Alt+B**  | Build pipeline        |
| **Ctrl+S** | Save pipeline         |
| **Ctrl+R** | Run pipeline          |
| **Ctrl+Z** | Undo                  |
| **Delete** | Delete selected node  |
| **Escape** | Deselect all          |

---

## 🎨 Design Philosophy

### Progressive Disclosure

**Level 1 (80% users)**: AI generates everything

- Single prompt input
- Click "Run" button
- See results

**Level 2 (15% users)**: Visual tweaking

- Click "Edit Pipeline"
- Adjust node settings
- Re-run pipeline

**Level 3 (5% users)**: Advanced customization

- Drag new nodes
- Custom code nodes
- Complex branching

### Spooky Theme

- Dark background (#0a0a0a)
- Neon green accent (#00ff88)
- Purple highlights (#8844ff)
- Subtle glow animations
- Realistic metallic pipes

---

## 🔧 Development

### Prerequisites

- Node.js 18+
- Chrome 140+
- PostgreSQL 14+ (for backend)

### Setup

```bash
# Install dependencies
cd backend && npm install

# Run migrations
npm run migrate

# Start dev server (with hot reload)
npm run dev
```

### Extension Development

```bash
cd extension

# The extension uses vanilla JS + Om.js
# No build step required — just reload extension in Chrome
```

### Code Style

- Modern ES2024+ JavaScript
- Om.js reactive components
- JSDoc for type safety
- No transpilation needed (Chrome 140+)

See `.kiro/steering/` for detailed coding guidelines.

---

## 🧪 Testing

```bash
cd backend
npm test
```

Test files:

- `tests/auth.test.js` — Authentication
- `tests/pipelines.test.js` — Pipeline CRUD
- `tests/webhooks.test.js` — Webhook handling

---

## 🚢 Deployment

### Extension

1. Build production version
2. Create ZIP file
3. Upload to Chrome Web Store

### Backend

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

Deployment script handles:

- Environment setup
- Database migrations
- AWS configuration
- Service restart

---

## 🤝 Contributing

Contributions welcome! Please read our guidelines:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Follow code style in `.kiro/steering/`
4. Write tests for new features
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing`)
7. Open Pull Request

### Development Rules

- One class per file
- Max 300 lines per file
- Use Om.js patterns (see `.kiro/steering/04-omjs-framework-rules.md`)
- JSDoc for all public APIs
- No `switch` statements (use object lookups)
- Modern JS only (no polyfills)

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see [LICENSE](LICENSE) file for details.

**TL;DR**: You can use, modify, and distribute this software freely, but any modifications must also be open-sourced under GPL v3.

---

## 🙏 Acknowledgments

- Inspired by the legendary **Yahoo Pipes** (RIP 2015)
- Built with [Om.js](https://github.com/omjs-org/omjs) reactive framework
- Icons from custom SVG sprite
- Developed by [Brahmastra Techeq](https://github.com/anil9973)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/anil9973/ghostpipes/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anil9973/ghostpipes/discussions)
- **Email**: [Contact maintainer](mailto:anil9973@example.com)

---

## 🗺️ Roadmap

- [ ] Chrome Web Store release
- [ ] Firefox extension port
- [ ] Cloud sync & sharing
- [ ] Marketplace for pipeline templates
- [ ] Mobile app (view-only)
- [ ] Collaborative editing
- [ ] Advanced AI nodes (vision, audio)
- [ ] Plugin system for custom nodes

---

## ⚠️ Status

**Version**: 0.0.1 (Early Development)

This project is in active development. APIs and features may change.

---

<div align="center">

**Made with 👻 by developers who miss Yahoo Pipes**

[⭐ Star on GitHub](https://github.com/anil9973/ghostpipes) • [🐛 Report Bug](https://github.com/anil9973/ghostpipes/issues) • [💡 Request Feature](https://github.com/anil9973/ghostpipes/issues)

</div>
