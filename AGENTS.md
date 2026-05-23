# Agent Orchestrator & Multi-Agent Execution Plan (AGENTS.md)
## Project: Minimalist Full-Stack Portfolio & Blog Engine

This document acts as an operational orchestrator for AI Coding Agents. It maps out specialized roles, execution phases, prompt templates, and validation criteria, allowing any coding assistant to step into the project and execute development with absolute clarity.

---

## 1. System Philosophy & Code Quality Standards

Any Agent working on this codebase must adhere strictly to these principles:
1.  **Strict MVC Architecture**: Maintain clear separation between Models, Razor Views, and Controllers. Business logic belongs in services/controllers; markup formatting belongs in Views; database schema maps belong in Models.
2.  **No Bulky Dependencies**: Rely on native .NET Core features first. For Markdown parsing, use *Markdig*. For styling, use customized *Bootstrap 5* variable overrides in `site.css` rather than installing heavy JS visual plugins.
3.  **Visual Silence Integration**: Do not add elements that are not defined in `docs/design.md`. Maintain generous margins (`py-5`, `my-5`), strict typography ratios, and thin borders.
4.  **SQL Parameter Security**: Never use raw, unparameterized SQL strings. All queries must utilize Entity Framework Core LINQ methods (which parameterized SQL automatically under the hood).
5.  **State Cleanliness**: All forms must contain HTML Anti-Forgery Tokens (`@Html.AntiForgeryToken()`) validated on controller actions (`[ValidateAntiForgeryToken]`).

---

## 2. Specialized Agent Roles

To divide and conquer development efficiently, tasks are assigned to four virtual AI Agent roles:

```
                  ┌──────────────────────────────┐
                  │   AGENT 1: Database & Auth   │ (Phase 1)
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   AGENT 2: CMS Backend Core  │ (Phase 2)
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   AGENT 3: UI Design & Style │ (Phase 3)
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │   AGENT 4: Deployment & SEO  │ (Phases 4-5)
                  └──────────────────────────────┘
```

### Agent 1: Database & Identity Agent
*   **Domain**: Models, Database Migrations, EF Core DBContext, and User Login Security.
*   **Focus**: Establishing the bedrock SQL Server connection, generating relational entities, creating the admin user schema, and securing login actions using .NET Cookie Authentication.

### Agent 2: Core MVC & CMS Backend Agent
*   **Domain**: Controller routes, Form handling, File uploading, and CRUD operations.
*   **Focus**: Building out the `AdminController` panel, coding secure methods to create/edit/delete blogs and projects, and piping public contact submissions into the SQL Server inbox.

### Agent 3: Minimalist UI & Styling Agent
*   **Domain**: Razor views, Bootstrap customizations, HSL variables, custom CSS, and lightweight JS transitions.
*   **Focus**: Overriding Bootstrap styles inside `wwwroot/css/site.css` to build the "Ink & Snow" Nordic Zen look. Programming micro-interactions (underline reveal, fade-on-scroll, progress bar).

### Agent 4: SEO, Performance & Integration Agent
*   **Domain**: Dynamic headers, SEO schemas, Web accessibility, Dockerfile container setups, and Vercel proxy configs.
*   **Focus**: Optimizing performance, creating the multi-stage Docker deployment script, setting up proxy paths in `vercel.json`, and rendering dynamic RSS feeds/Sitemaps.

---

## 3. Phased Execution Pipeline

An agent starting work on this repository must locate their active phase, load the matching prompt template, execute the steps, and verify results before proceeding.

### Phase 1: Database & Core Environment (Agent 1)
1.  **Initialize EF Core**: Add NuGet dependencies (`Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Design`, `Microsoft.EntityFrameworkCore.Tools`).
2.  **Define Entities**: Implement `Project.cs`, `BlogPost.cs`, `ContactSubmission.cs`, and `AdminUser.cs` in the `/Models` directory.
3.  **Setup DbContext**: Write `ApplicationDbContext.cs` mapping models to DB tables.
4.  **Configure Migration**: Run `dotnet ef migrations add InitialCreate` and execute DB update. Set connection strings securely.
5.  **Verification**: Write a simple unit integration test or run database health queries confirming connections.

### Phase 2: Administrative CMS Panel (Agent 2)
1.  **Set Up Authentication**: Configure standard Cookie Authentication middleware in `Program.cs`.
2.  **Auth Routing**: Code the `/admin/login` controllers, validating hashes using BCrypt/PBKDF2.
3.  **Build Dashboard View**: Create clean admin dashboard listing blogs and projects.
4.  **Create CRUD Operations**: Program edit/delete/create panels for posts and projects, using markdown textareas.
5.  **Verification**: Log into the CMS, create a draft blog and a project case study, and verify they exist in SQL Server.

### Phase 3: Public Views & Nordic Styling (Agent 3)
1.  **Bootstrap Variable Resets**: Clean up `site.css` using the HSL color variables and flat border resets detailed in `docs/design.md`.
2.  **Structure Razor Views**: Draft `/Views/Shared/_Layout.cshtml` adding the custom glassmorphism navigation bar and thin footer.
3.  **Home Page Layout**: Build `/Views/Home/Index.cshtml` structuring the Hero, About Timeline, Skills Catalog, and Contact CTA form.
4.  **Interactive Scripting**: Write the Intersection Observer scroll fade-ins and tag highlights in `site.js`.
5.  **Verification**: Render pages locally, validating layout responsiveness on multiple viewport simulated widths.

### Phase 4: Dynamic Integration & Public Modules (Agent 2 & 4)
1.  **Public Projects Feed**: Code `/projects` pulling records from the SQL context. Include custom filtering tags.
2.  **Markdown Parsing**: Configure the *Markdig* parser to translate post contents into HTML strings. Sanitise all output strings.
3.  **Blog Reading Screen**: Assemble `/blog/{slug}` adding the top reading progress indicator.
4.  **Verification**: Click dynamic projects and read full-length blogs, confirming proper styles on all headers and code blocks.

### Phase 5: SEO Tuning & Deploy Launch (Agent 4)
1.  **Dynamic SEO Middleware**: Add helper functions to inject title/description meta tags per article.
2.  **Structured JSON-LD Markups**: Write scripts outputting Schema JSONs inside View headers.
3.  **Create Production Dockerfile**: Set up the multi-stage C# container build in the root.
4.  **Configure Vercel Proxies**: Add `vercel.json` routing configurations.
5.  **Verification**: Run Lighthouse tests locally, audit Docker container packaging, and verify build success.

---

## 4. Agent Command Prompt Templates

To invoke or instruct a subagent during developer operations, use these ready-to-run prompts:

### Prompt to Build Phase 1 & 2 (Backend & Security)
> **Role**: Principal Database & Security Engineer
> **Context**: You are building the foundation of a minimalist ASP.NET Core MVC portfolio.
> **Task**: Read `docs/prd.md` and `docs/sdd.md` carefully. Install core EF Core packages for SQL Server. Implement Model files (`Project.cs`, `BlogPost.cs`, `ContactSubmission.cs`, `AdminUser.cs`), configure `ApplicationDbContext.cs`, build out Cookie-based auth filters, and design the CRUD controllers in `/Controllers/AdminController.cs`. Use secure BCrypt hashing. Write anti-forgery guards on all database-writing actions.

### Prompt to Build Phase 3 (Nordic Styling & Public Views)
> **Role**: Ultra-Premium Front-End & UI Specialist
> **Context**: You are coding the minimalist visual experience.
> **Task**: Read `docs/design.md` and check the styling tokens. Edit `wwwroot/css/site.css` to build the "Ink & Snow" dark-mode palette using HSL variables. Strip rounded borders and dropshadows. Custom-style all `.btn` elements. Build Razor Views for the landing page `/Home/Index.cshtml` including the Hero, experience timeline, skills filter, and AJAX contact form. Inject smooth vanilla CSS transition animations.

---

## 5. Global Project Hand-off Checklist
*   [ ] Does the codebase conform strictly to structural directories (`/Controllers`, `/Models`, `/Views`)?
*   [ ] Are all SQL actions parameterized under EF Core?
*   [ ] Are there any neon gradients or generic elements contradicting `docs/design.md`?
*   [ ] Do all admin pages prompt authorization access blocks?
*   [ ] Does `vercel.json` route correctly back to the dynamic container URL?
