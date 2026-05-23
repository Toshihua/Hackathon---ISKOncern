# UI Design Specification
## Project: Minimalist Full-Stack Portfolio & Blog Engine

---

## 1. Visual Vibe & Design Philosophy: Nordic Zen Minimalism

To make this portfolio instantly stand out as **ultra-premium and professional**, the interface adopts a design language called **Nordic Zen Minimalism**. This philosophy is built around three core pillars:
1.  **Visual Silence**: Maximizing whitespace (empty margins and padding) to create breathing room. Content is not fighting for attention.
2.  **Structural Rigor**: Using thin, precise divider lines (`1px`) and grids instead of heavy cards and shadows.
3.  **High-Contrast Typographic Hierarchy**: Pairing massive, thin headers with tight, highly readable body blocks.

> [!TIP]
> **Minimalism is not the absence of design; it is the absolute refinement of details.**
> We completely avoid default Bootstrap styles, rounded buttons, bulky drop-shadows, and neon gradients. Instead, we use unstyled buttons, elegant underline hover animations, and HSL-curated color systems.

---

## 2. Color Palettes (Dark Mode Primary)

We define a premium HSL (Hue, Saturation, Lightness) color system. HSL is chosen because it allows seamless tuning of borders, active states, and dim overlays.

### 2.1 The Signature "Ink & Snow" Dark Palette (Primary Theme)
*   **Background (Canvas)**: `hsl(240, 10%, 4%)` (Deep Obsidian Ink - `#0A0A0C`)
*   **Surface (Panels/Inputs)**: `hsl(240, 8%, 7%)` (Subtle off-dark - `#111113`)
*   **Primary Text (Snow)**: `hsl(0, 0%, 98%)` (High-contrast soft white - `#FAFAFA`)
*   **Secondary Text (Muted Slate)**: `hsl(240, 5%, 65%)` (Warm gray read-copy - `#A1A1A5`)
*   **Border (Divider Line)**: `hsl(240, 5%, 15%)` (Ultra-subtle structure border - `#242426`)
*   **Accent Color (Ethereal Blue)**: `hsl(215, 100%, 65%)` (Soft focus highlight - `#4B9BFF`)

### 2.2 The "Warm Sand" Light Palette (Alternative/Toggle Theme)
*   **Background (Canvas)**: `hsl(30, 20%, 98%)` (Alabaster cream - `#FDFBF7`)
*   **Surface (Panels/Inputs)**: `hsl(30, 15%, 95%)` (Soft beige - `#F5F2EC`)
*   **Primary Text (Carbon)**: `hsl(240, 12%, 10%)` (Deep charcoal - `#18181B`)
*   **Secondary Text (Stone)**: `hsl(240, 6%, 45%)` (Muted mid-gray - `#71717A`)
*   **Border (Divider Line)**: `hsl(30, 10%, 88%)` (Thin line border - `#E5E1D8`)
*   **Accent Color (Umber)**: `hsl(25, 40%, 35%)` (Earthy deep brown - `#7C4A32`)

---

## 3. Typography Systems

A minimalist site relies on stellar type selection to convey premium quality. We load two Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Outfit:wght@200;400;600&display=swap" rel="stylesheet">
```

### 3.1 Font Roles
*   **Header / Title Display**: **Outfit** (Sans-serif)
    *   *Weight*: `200` (Extra Light) or `400` (Regular) for massive page headers; `600` (Semi-Bold) for small category tags.
    *   *Letter-spacing*: `-0.03em` for clean, tight character spacing.
*   **Body Copy (General UI)**: **Inter** (Sans-serif)
    *   *Weight*: `300` (Light) or `400` (Regular). Extremely legible at small sizes.
*   **Blog / Case Study Reading**: **Playfair Display** (Serif)
    *   *Weight*: `400` (Regular) or `400 Italic` for editorial pull-quotes. Relieves eye strain during long-form reading.

---

## 4. UI Grid & Wireframe Outlines

### 4.1 Global Page Shell Layout
```
+-----------------------------------------------------------------------+
|  [Logo/Initials]                                  [Projects]  [Blog]  | <-- Header: 1px bottom-border, transparent glassmorphism
+-----------------------------------------------------------------------+
|                                                                       |
|  [MASSIVE HEADING: DESIGNING WITH SIMPLICITY]                        | <-- Hero Section
|                                                                       |
|  Short introduction paragraph set to 60% of the screen width.         |
|                                                                       |
|  [--> View Projects]    [Download Resume]                             | <-- Minimal borders, zero border-radius
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  ABOUT                                                                |
|  1998 ────── Senior Systems Architect at Company X                     | <-- Minimal Timeline:
|  2001 ────── Tech Lead at Company Y                                   |     Thin vertical line, no bulky icons
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  TECHNICAL CAPABILITIES                                               |
|  Search skills...                                                     | <-- Filter bar
|  [ Languages ]   [ Frameworks ]   [ Databases ]                       |
|  #C#   #dotnet   #SQL-Server   #TypeScript   #React   #Docker         | <-- Skill tags in responsive block
|                                                                       |
+-----------------------------------------------------------------------+
|  © Portfolio 2026. Made with MVC.                         [Back to Top] | <-- Footer: 1px top-border
+-----------------------------------------------------------------------+
```

### 4.2 Projects Separate Gallery Route (`/projects`)
```
+-----------------------------------------------------------------------+
|  ALL  //  WEB DEVELOPEMENT  //  SYSTEM SYSTEMS  //  AI & MACHINE       | <-- Category filter bar: text link separators
+-----------------------------------------------------------------------+
|                                                                       |
|  +---------------------------------+  +-------------------------------+
|  | [Project 1 Cover Photo]         |  | [Project 2 Cover Photo]       |
|  |                                 |  |                               |
|  | 01. The ISKOncern Chat Desk     |  | 02. Tourism Management App    | <-- Card Details:
|  | ASP.NET Core / React / Tailwind |  | C# / MVC / Bootstrap          |     No background card container,
|  |                                 |  |                               |     image transitions on hover
|  +---------------------------------+  +-------------------------------+
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## 5. Tailoring Bootstrap 5 to Minimalism

Bootstrap 5 is standard, but its default aesthetics are generic. We apply custom rules in `site.css` to override standard classes:

### 5.1 CSS Variables Overrides (`wwwroot/css/site.css`)
```css
:root {
    /* Custom HSL definitions */
    --canvas: 240 10% 4%;
    --surface: 240 8% 7%;
    --text-primary: 0 0% 98%;
    --text-secondary: 240 5% 65%;
    --border-color: 240 5% 15%;
    --accent: 215 100% 65%;
}

/* Global resets to strip native styling */
body {
    background-color: hsl(var(--canvas));
    color: hsl(var(--text-primary));
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    line-height: 1.7;
    letter-spacing: -0.01em;
}

h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', sans-serif;
    font-weight: 200;
    letter-spacing: -0.02em;
    color: hsl(var(--text-primary));
}

/* Bootstrap Button Overrides */
.btn {
    border-radius: 0px !important; /* Zero roundness for aggressive minimalist structure */
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-primary {
    background-color: transparent !important;
    color: hsl(var(--text-primary)) !important;
    border: 1px solid hsl(var(--text-primary)) !important;
}

.btn-primary:hover {
    background-color: hsl(var(--text-primary)) !important;
    color: hsl(var(--canvas)) !important;
}

/* Stripped Cards */
.card {
    background-color: transparent !important;
    border: none !important;
    border-bottom: 1px solid hsl(var(--border-color)) !important;
    border-radius: 0px !important;
    padding: 1.5rem 0;
}
```

---

## 6. Premium Micro-Interactions & Transitions

Subtle animations give a premium, reactive feel to the site.

### 6.1 Hover Link Reveal (Underline from Center)
Used for navigation items and public list headings:
```css
.nav-link-minimal {
    position: relative;
    color: hsl(var(--text-secondary));
    text-decoration: none;
    transition: color 0.3s ease;
}

.nav-link-minimal:hover {
    color: hsl(var(--text-primary));
}

.nav-link-minimal::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: hsl(var(--text-primary));
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
}

.nav-link-minimal:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
}
```

### 6.2 Scroll-Activated Fade (Intersection Observer)
To prevent heavy load jumps, elements fade in elegantly as the user scrolls down:
```javascript
// site.js
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => {
        observer.observe(el);
    });
});
```
```css
/* site.css */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-visible {
    opacity: 1;
    transform: translateY(0);
}
```

### 6.3 Blog Reading Progress Bar
An dynamic indicator that scales horizontally at the top of the viewport during article scrolls:
```javascript
window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progressBar = document.getElementById("reading-progress");
    if (progressBar && scrollable > 0) {
        progressBar.style.width = `${(scrolled / scrollable) * 100}%`;
    }
});
```
```css
#reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background-color: hsl(var(--accent));
    width: 0%;
    z-index: 1000;
    transition: width 0.1s ease;
}
```

---

## 7. Document Design Review

This UI Specification guarantees:
1.  **Aesthetic Cohesion**: Visual styles remain uniform across public landing layouts and private admin panels.
2.  **Asset Reliability**: All animations use CSS transitions and vanilla JS actions, keeping page speed high without the need for large animation libraries.
3.  **Bootstrap 5 Integrity**: The framework provides structure, but CSS variables customize the layouts to guarantee a sleek and professional finish.
