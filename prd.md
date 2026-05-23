# Product Requirements Document (PRD): ISKOncern

## 1. Executive Summary
ISKOncern is a centralized campus incident reporting and management platform designed to eliminate the friction of legacy reporting methods. It provides a unified hub for logging, tracking, and resolving campus issues, transforming a reactive process into a proactive, data-driven system.

## 2. Problem Statement
Campus incident reporting is fundamentally broken due to a reliance on emails, paper forms, and siloed offices. This leads to:
* **High Friction:** Reporting takes too long.
* **Lack of Transparency:** Reports enter a "black hole" with no status visibility.
* **Administrative Blindspots:** Scattered data prevents trend identification and efficient resource allocation.

## 3. Goals and Objectives
* **Centralize Data:** Consolidate reports into a single database.
* **Reduce Time-to-Report:** Enable submissions in under 60 seconds.
* **Improve Transparency:** Allow users to track report status without in-person follow-ups.
* **Protect Privacy:** Provide a secure, anonymous reporting channel.

## 4. Target Audience
* **Internal Stakeholders:** Students, Faculty, Staff.
* **External Stakeholders:** Visitors, Parents, Alumni.
* **Administrators:** Security, Facilities, Student Affairs.

## 5. Feature Requirements
### 5.1 Streamlined Intake Form
* Responsive and intuitive UI.
* Dynamic category dropdowns (e.g., Maintenance, Security, Academic).
* Media upload capabilities for evidence.
* Option for normal or anonymous submission.

### 5.2 Admin Management Dashboard
* Centralized queue of incoming tickets.
* Status toggles (Pending, In Progress, Resolved).
* Robust filtering and sorting by category, date, or assignment.

### 5.3 Anonymous Chat System
* Two-way communication thread linked to a specific Report ID.
* Allows admins to request more info and reporters to reply without revealing identity.

## 6. Future Scope
* Data Analytics Module (Heatmaps, monthly reports).
* Automated AI Triage for routing.
* SLA Alerts (48-hour unresolved notifications).
