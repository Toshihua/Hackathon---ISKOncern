# Product Requirements Document (PRD)
## Project: Minimalist Full-Stack Portfolio & Blog Engine

---

## 1. Executive Summary & Core Vision

The goal of this project is to build an ultra-premium, minimalistic, full-stack personal portfolio and blog engine. Instead of relying on rigid, templated SaaS builders, this solution leverages an enterprise-grade stack—**ASP.NET Core MVC**, **Bootstrap 5**, and **Microsoft SQL Server**—to deliver maximum control, fast load times, and clean semantic structures.

### Core Value Propositions
*   **Visual Silence (Minimalism)**: Generous whitespace, elegant typography, curated high-contrast styling, and the complete absence of visual clutter. The content remains the hero.
*   **Full-Stack Autonomy**: A customized, secure content management system (CMS) allowing the owner to add, edit, and delete projects and blog posts in real-time, backed by a SQL Server relational database.
*   **Uncompromising Performance**: Optimized server-side rendering (SSR) via ASP.NET Razor Views, delivering excellent SEO and near-instant initial page loads.

---

## 2. User Roles & Target Audience

### 2.1 Public Visitors (Recruiters, Tech Leads, Engineering Managers)
*   **Goals**: Swiftly assess the owner's core engineering skills, review high-quality professional projects, read technical articles, and initiate direct contact.
*   **Needs**: Blazing-fast page transitions, responsive layouts on both mobile and widescreen desktops, clutter-free reading modes, and clickable direct-action buttons (e.g., CV download, GitHub links).

### 2.2 System Administrator (Portfolio Owner)
*   **Goals**: Easily publish new blogs, showcase recently completed projects, review messages sent through the contact form, and edit existing details without touch-deploying code.
*   **Needs**: A secure, clean dashboard that handles Markdown inputs, manages file assets, and tracks submission logs securely.

---

## 3. Functional Specifications

The application will be structured into distinct sections, keeping the main page sleek and uncluttered, while moving dense sections (such as projects and blog reads) to specialized sub-routes.

```
/                     --> Hero, About, Skills, Leadership, Contact CTA
/projects             --> Project Portfolio Directory (Grid/List filter)
/projects/{id}        --> Deep Dive Project View (Markdown details, media carousel)
/blog                 --> Technical Blog Directory (Search, Tags, Cards)
/blog/{slug}          --> Article Reading Page (Reading progress bar, syntax-highlighted code)
/admin/login          --> Secure Admin Portal Entry
/admin/dashboard      --> Admin Panel (CRUD Blogs, CRUD Projects, Contact Inbox)
```

---

### 3.1 Public Portfolio Sections (Main Route `/`)

#### A. Hero Section
*   **Requirement**: A bold, high-contrast typography block serving as an immediate professional introduction.
*   **Features**:
    *   Dynamic, minimalistic micro-animation (e.g., a slow-fading subtitle or typing effect).
    *   Primary CTA: "View Work" (smooth scrolls to Skills or navigates to `/projects`).
    *   Secondary CTA: "Download Resume" (direct PDF download with download logging).
    *   Clean social links (GitHub, LinkedIn, Email) represented by sleek, unstyled SVG icons.

#### B. About & Professional Background
*   **Requirement**: A narrative summarizing the owner's journey, credentials, and professional philosophy.
*   **Features**:
    *   A cohesive, minimalistic timeline visualizing past roles, university education, and major milestones.
    *   Interactive hover highlights to showcase tech stacks used in each specific role.

#### C. Technical Skills Catalog
*   **Requirement**: An interactive visual inventory of technical capabilities.
*   **Features**:
    *   Categorization: *Languages*, *Backend frameworks*, *Frontend & Styling*, *Database Systems*, *Tools & DevOps*.
    *   Sleek tag-based interface with hover transitions.
    *   Lightweight search filter: Typing a skill instantly highlights matching categories and dims non-matching tags.

#### D. Leadership & Credentials
*   **Requirement**: Highlight volunteer leadership, community work, certificates, and soft skills that distinguish the owner.
*   **Features**:
    *   Clean card layouts for certifications (with links to credentials).
    *   Brief narratives detailing mentorship, hackathon organizing, or student leadership.

#### E. Contact CTA
*   **Requirement**: A sleek contact section to convert visitors into direct leads.
*   **Features**:
    *   A minimalistic form (Fields: Name, Email, Subject, Message).
    *   AJAX-based submission to prevent page reload, showing a sleek success toast.
    *   Spam prevention: Non-intrusive honeypot fields and backend server-side validations.
    *   Database Logging: Submissions are written directly to SQL Server and flagged in the Admin Inbox.

---

### 3.2 Dynamic Projects Engine (Sub-Route `/projects`)

#### A. Project Directory Page (`/projects`)
*   **Requirement**: A dedicated index of projects.
*   **Features**:
    *   Filter tabs (e.g., "All", "Web", "Mobile", "AI/ML", "DevOps").
    *   Minimalistic cards displaying high-quality thumbnails, concise taglines, and tech stack badges.
    *   Hover state: Sleek overlay displaying summary text and a "Read Case Study" link.

#### B. Case Study Detail Page (`/projects/{slug}`)
*   **Requirement**: Deep-dive explanation of individual projects.
*   **Features**:
    *   Support for rich media: image/video carousel to showcase UI mockups or walkthroughs.
    *   Structured layout: The Problem, The Solution, Technical Challenges, and Key Takeaways.
    *   Quick metadata sidebar: Duration, Role, Tech Stack, Live Demo Link, GitHub Link.

---

### 3.3 Dynamic Blog Engine (Sub-Route `/blog`)

#### A. Article Feed Page (`/blog`)
*   **Requirement**: A clean vertical feed of written articles.
*   **Features**:
    *   Minimalist search bar and category tag clouds.
    *   List items featuring title, publication date, category, estimated reading time, and short excerpt.
    *   Paginated or infinite scroll load matching the minimalistic design.

#### B. Article Reading View (`/blog/{slug}`)
*   **Requirement**: A highly readable, distraction-free environment for consuming articles.
*   **Features**:
    *   Excellent typography: Large, highly legible font sizes, proper line spacing, and optimal line length (50-75 characters).
    *   Syntax highlighting: Prism.js or Highlight.js styled to match the minimalist theme for code snippets.
    *   Reading progress bar fixed at the top of the browser window.

---

### 3.4 Administrative CMS Portal (Sub-Route `/admin`)

#### A. Authentication
*   **Requirement**: Secure access restriction to CMS functions.
*   **Features**:
    *   Single admin account model.
    *   Password hashing using BCrypt or ASP.NET Core Identity Core.
    *   Secure Session/Cookie management with CSRF tokens on all forms.

#### B. Dashboard Index (`/admin/dashboard`)
*   **Requirement**: Quick monitoring and navigation hub.
*   **Features**:
    *   Summary metrics: Total blogs, Total projects, Unread contact forms.
    *   Contact Inbox list: Chronological display of messages with read/unread toggle and delete actions.

#### C. Blog & Project CMS Tools
*   **Requirement**: Comprehensive CRUD interfaces.
*   **Features**:
    *   Markdown Editor: WYSIWYG or split-pane editor (e.g., SimpleMDE) allowing text styling and image embedding.
    *   Input Fields: Title, Slug (auto-generated from title), Tech Stack tags, Excerpt, Cover Image URL, Live Link, GitHub Link, Category, Publish Switch.

---

## 4. Non-Functional Requirements

### 4.1 Security
*   **Authentication**: Admin pages must be protected under a dedicated authorization filter or standard ASP.NET cookie-based authorization.
*   **Input Sanitization**: Use AntiXSS frameworks to filter inputs. All markdown rendering on public pages must pass through a strict HTML sanitizer (e.g., Ganss HtmlSanitizer) on the server side to block cross-site scripting (XSS).
*   **Data Integrity**: Leverage Entity Framework Core parameterized queries to prevent SQL Injection out of the box.

### 4.2 Search Engine Optimization (SEO)
*   **Dynamic Head Tags**: Unique Titles, Meta Descriptions, and Canonical Tags for each blog post and project page.
*   **Semantic Structures**: Strict adherence to structural outlines (`<h1>` -> `<h2>` -> `<h3>`).
*   **Structured Data**: Automatic generation of JSON-LD schemas (BlogPosting schema for articles, ProfessionalService/Portfolio schema for landing page).
*   **Sitemap & Robots**: Clean `/sitemap.xml` and `/robots.txt` dynamically mapped to existing records.

### 4.3 Performance
*   **Speed**: Target GTmetrix/PageSpeed Insights score of 95%+ by serving optimized images, minifying CSS/JS, and utilizing browser caching.
*   **Assets**: Host static resources (images, PDFs) in an external, fast cloud-based storage system (such as Vercel Blob, Cloudinary, or AWS S3) instead of local folders to maintain database performance and fast deployments.

---

## 5. AI Task Prioritization & MoSCoW Roadmap

To ensure maximum progress and eliminate architectural re-work, we have structured the backlog using an **AI-driven dependency and value mapping technique**. Development is broken down into five distinct phases, moving from foundational databases up to visual polished refinements.

```
       [PHASE 1: Foundations]
                 │
                 ▼
       [PHASE 2: Backend CMS Core]
                 │
                 ▼
       [PHASE 3: Public Views & Bootstrap]
                 │
                 ▼
       [PHASE 4: Dynamic Integration]
                 │
                 ▼
       [PHASE 5: Launch & SEO Tuning]
```

### MoSCoW Backlog Matrix

| Category | Task Item | Priority Score (1-10) | Phase | Rationale & Dependencies |
| :--- | :--- | :---: | :---: | :--- |
| **Must Have** | **Database Schema & SQL Server setup** | 10 | Phase 1 | The bedrock of the entire application. All dynamic data models depend on this. |
| **Must Have** | **ASP.NET Core Project initialization & EF Core integration** | 10 | Phase 1 | Establishes the application structure, controllers, and database context. |
| **Must Have** | **Secure Admin Auth & Login Route** | 9 | Phase 2 | Must be built before any CRUD interfaces to secure the content upload flows. |
| **Must Have** | **Admin Project & Blog CMS CRUD** | 9 | Phase 2 | Allows populating real data before public-facing screens are completed. |
| **Must Have** | **Layout Shell & Minimalist Bootstrap Theme** | 8 | Phase 3 | Core styling, navigation bar, and footer shared across the whole app. |
| **Must Have** | **Home View (`/`) Controllers & Razor Pages** | 8 | Phase 3 | Main landing page containing Hero, About, Skills, and Leadership. |
| **Must Have** | **Dedicated Project Directory (`/projects`)** | 8 | Phase 4 | Displays project grids pulling directly from SQL Server database context. |
| **Must Have** | **Dynamic Blog Engine (`/blog` & `/blog/{slug}`)** | 8 | Phase 4 | Feeds list items and parses markdown text safely to HTML. |
| **Must Have** | **Contact Form Submission & Admin Inbox Logging** | 7 | Phase 4 | Links public landing page inputs securely to the admin review pane. |
| **Should Have** | **Advanced Markdown Code-Highlighting & Reading Tracker** | 6 | Phase 4 | Elevates the premium developer reading experience. |
| **Should Have** | **Interactive Skill Catalog Search/Filter** | 6 | Phase 3 | Adds interactive premium micro-animations using light JS. |
| **Should Have** | **Dynamic SEO Tag Generator & Schema Markup** | 5 | Phase 5 | Prepares the site for ranking, generating customized headers per article. |
| **Could Have** | **Automated Email Notifications for Contact Form** | 4 | Phase 5 | Dispatches immediate alert emails when a recruiter submits the form. |
| **Could Have** | **Dark/Light Theme Toggle** | 3 | Phase 5 | Optional premium layout visual switch using custom CSS/JS. |

---

## 6. Document Validation Criteria

To mark the PRD phase complete, the project requirements must satisfy:
1.  A clear mapping between the functional sections and the routes.
2.  A robust definition of administrative boundaries to safeguard full-stack actions.
3.  A highly structured database foundation to serve the dynamic systems without high overhead.
