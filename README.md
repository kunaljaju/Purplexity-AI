# Purplexity | AI Web Scrapping Search Engine 

Purplexity is an elegant, fast, and factual real-time search synthesis engine. Featuring a liquid glass search interface, dynamic search grounding, and a futuristic dark purple theme, it enables users to explore knowledge deeply and organize findings efficiently.

## Core Services & Capabilities

### 1. Grounded Search Synthesis
Purplexity integrates search engine grounding with large language models to construct objective, factual responses complete with in-line source citations.

### 2. Multi-Mode Search Focus
Select the appropriate depth and source filter for your research inquiries:
- **Standard Search**: General web grounding for swift, real-time factual questions.
- **Copilot Research**: Deep investigative research sweeps presenting multi-dimensional reports, perspective analysis, and side-by-side matrices.
- **Academic Literature**: Dense scientific synthesis whitelisting authoritative journals, literature, and statistics.
- **Creative Writing**: Local assistant mode optimized for high-quality prose and code generation without web search latency.

### 3. Personal Knowledge Library
Keep track of your research history and build a custom repository of facts:
- **Thread History**: Seamlessly save and switch between active search conversations from the sidebar.
- **Saved Findings**: Bookmark specific AI insights to view, copy, or delete them later from your personal knowledge dashboard.

---

## Key Features

- **Liquid Glass UI**: Beautiful, interactive interface featuring dynamic background glowing orbs, smooth transitions, and hover-triggered micro-animations.
- **Native Light/Dark Modes**: Responsive theme controls allowing users to switch between light and dark visual aesthetics.
- **Interactive Markdown Tables**: Automatically parses markdown tables into responsive, paginated, and column-sortable spreadsheet views.
- **Exportable Datasets**: Export compiled tables instantly to standard TSV format (fully compatible with Microsoft Excel and Google Sheets).
- **Secure Authentication**: Includes standalone credentials-based signup/login and Google OAuth sign-in via Firebase.
- **Contextual Follow-Ups**: Dynamically suggests 3-4 interactive questions after every search turn to guide subsequent research.
- **Background Vector Archival**: Automatically serializes and archives search query results into a PostgreSQL database utilizing pgvector embeddings for long-term memory.

---

## Project Structure

```
├── prisma/
│   └── schema.prisma       # Database schema definition (Prisma ORM)
├── server/
│   ├── controllers/        # Express controllers handling routing actions
│   │   ├── bookmarkController.js
│   │   ├── searchController.js
│   │   └── sessionController.js
│   ├── middleware/         # Custom Express middlewares
│   │   └── auth.js         # JWT validation & user verification middleware
│   ├── routes/             # Modular express API routes
│   │   ├── index.js        # Main route router mounting domain routes
│   │   ├── authRoutes.js
│   │   ├── bookmarkRoutes.js
│   │   ├── searchRoutes.js
│   │   └── sessionRoutes.js
│   ├── services/           # External and internal logic services
│   │   └── ai/
│   │       ├── followUpService.js   # Related questions generation
│   │       ├── openRouterService.js # Text completion & answer synthesis
│   │       ├── tavilyService.js     # Web scraping & search grounding
│   │       └── vectorService.js     # Background pgvector storage
│   └── db.js               # PostgreSQL Prisma client initializer
├── src/                    # Frontend React SPA
│   ├── components/         # Reusable React UI components
│   │   ├── AuthPage.jsx
│   │   ├── ChatResultPanel.jsx
│   │   ├── DashboardView.jsx
│   │   ├── FormattedTable.jsx
│   │   ├── LandingSearchPanel.jsx
│   │   ├── PurplexityLogo.jsx
│   │   └── Sidebar.jsx
│   ├── lib/
│   │   └── firebase.js     # Firebase config & Google Auth initialization
│   ├── App.jsx             # Main application layout, state, and theme control
│   ├── index.css           # Styling system config
│   └── main.jsx            # React root mount entry point
├── DEPLOY.md               # Dedicated deployment & setup manual
├── index.html              # Frontend DOM shell
├── package.json            # Dependencies and script configuration
├── server.js               # Express application entry point
└── vite.config.js          # Vite configuration
```

---

## Services & Architecture

### Services
- **Tavily Service (`server/services/ai/tavilyService.js`)**: Executes web crawls via the Tavily Search API to fetch grounded information sources.
- **OpenRouter Service (`server/services/ai/openRouterService.js`)**: Coordinates context assembly and queries the OpenRouter API (Gemini, Claude, GPT) to synthesize structured answers.
- **FollowUp Service (`server/services/ai/followUpService.js`)**: Generates 3–4 interactive follow-up questions relevant to the answer.
- **Vector Service (`server/services/ai/vectorService.js`)**: Vectorizes search outcomes and stores them using `pgvector` in the database asynchronously.

### API Routes
All endpoints are prefix-mounted under `/api`.

#### 🔑 Authentication (`/api/auth`)
*   `POST /signup` - Register a new account.
*   `POST /login` - Log in using credentials.
*   `POST /firebase-login` - Authenticate/provision via Google OAuth.
*   `GET /config-status` - Check connection status to PostgreSQL.

#### 🔍 Search (`/api/search`)
*   `POST /` - Query synthesis pipeline (Tavily crawling + OpenRouter completions).

#### 💬 Chat Sessions (`/api/me/sessions`)
*   `GET /` - Retrieve user conversation history list.
*   `POST /` - Save/update session thread.
*   `DELETE /:id` - Terminate a specific conversation thread.

#### 📌 Bookmarks (`/api/me/bookmarks`)
*   `GET /` - Load saved bookmark list.
*   `POST /` - Save target answer snippet as bookmark.
*   `DELETE /:id` - Remove target bookmark.

---

## Author & License

- **Author**: [Kunal Jaju](https://github.com/kunaljaju)
- **License**: Licensed under the [MIT License](LICENSE)


