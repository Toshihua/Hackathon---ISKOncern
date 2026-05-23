# ISKOncern
> A centralized campus incident reporting and management platform.

## Project Overview
ISKOncern is designed to eliminate the friction of legacy campus incident reporting methods. It bridges the communication gap between the campus community and administration by providing a unified hub for logging, tracking, and resolving campus issues. ISKOncern transforms a reactive, paper-heavy process into a proactive, data-driven system.

## Problem Statement
Campus incident reporting is fundamentally broken. Currently, students, faculty, and visitors are forced to navigate a confusing maze of emails, paper forms, and siloed administrative offices just to report an issue. This creates three critical pain points:
* **High Friction:** Reporting takes too long, discouraging people from speaking up.
* **Lack of Transparency:** Once a report is filed, it enters a "black hole" with no visibility into its status, leaving the community frustrated.
* **Administrative Blindspots:** Because reports are scattered across different mediums, administrators cannot identify campus-wide trends, allocate resources efficiently, or prioritize critical safety hazards.

## Proposed Solution
ISKOncern replaces scattered communications with a single, transparent reporting hub. It empowers anyone on campus to log issues instantly with rich context (photos, categories), while equipping administrators with a unified backend dashboard to triage, route, and resolve these concerns in real time.

### Objectives
* **Centralize Data:** Consolidate all campus reports into a single, reliable database.
* **Reduce Time-to-Report:** Enable users to submit actionable reports in under 60 seconds.
* **Improve Resolution Transparency:** Give users a way to track the status of their reports without needing to follow up in person.
* **Protect User Privacy:** Encourage reporting of sensitive issues through a secure, anonymous channel.

## Target Users
1. **Internal Stakeholders (Students, Faculty, Staff):** The primary reporters who encounter day-to-day issues (e.g., broken facilities, academic concerns, localized safety hazards).
2. **External Stakeholders (Visitors, Parents, Alumni):** Occasional campus guests who need an accessible, login-free way to report immediate concerns.
3. **Administrators (Security, Facilities, Student Affairs):** The operational teams who receive, categorize, update, and resolve the submitted tickets.

## Features and Functionalities
* **Streamlined Intake Form:** A responsive, intuitive submission page featuring standard input fields, dynamic category dropdowns (e.g., Maintenance, Security, Academic), and media upload capabilities for photographic evidence.
* **Admin Management Dashboard:** A centralized control panel for administrators to monitor incoming tickets. Includes status toggles (Pending, In Progress, Resolved) and robust filtering/sorting by category or date to prioritize urgent issues.
* **Anonymous Chat System:** A secure two-way communication thread linked to a specific report ID. This allows admins to ask follow-up questions and reporters to provide more context without ever revealing their identity.

## System Architecture & Tech Stack
The system follows a highly reliable Client-Server architecture designed for rapid development and deployment.

* **Frontend (Presentation Layer):** HTML & CSS
  * Ensures a lightweight, universally accessible frontend without the overhead of setting up complex JavaScript frameworks. Allows for rapid UI prototyping.
* **Backend (Application Layer):** C#
  * A strongly-typed, enterprise-grade language that prevents runtime errors and handles server-side logic cleanly. Ideal for building secure, scalable endpoints quickly.
* **Database (Data Layer):** SQL Server
  * Provides robust relational data integrity, ensuring that dashboard filters, sorts, and status updates work flawlessly without data corruption.
* **IDE:** Microsoft Visual Studio
  * Offers out-of-the-box debugging, seamless database integration, and rapid testing capabilities.

## User Flows

### The Reporter Flow
1. User accesses the ISKOncern web portal.
2. User fills out the streamlined intake form (Category, Description, Media).
3. User selects whether to submit normally or anonymously.
4. System generates a unique Report Tracking ID and a secure link for the user to check updates or reply to admin messages.

### The Admin Flow
1. Admin logs into the secure backend dashboard.
2. Admin views the queue of reports, filtering by "Unassigned" or specific categories.
3. Admin opens a ticket, reviews the media, and updates the status to "In Progress."
4. If details are missing, the admin sends a message via the Anonymous Chat System.
5. Once the issue is fixed, the admin toggles the ticket to "Resolved."

## Expected Impact
Implementing ISKOncern will immediately reduce the administrative overhead of manual triaging. By lowering the barrier to reporting, the campus will see an initial spike in logged issues, followed by a steady decrease in average resolution times. Ultimately, it builds a culture of accountability and trust between the student body and the administration.

## Future Improvements
To scale beyond the MVP, the following features are mapped for future sprints:
* **Data Analytics Module:** Heatmaps and automated monthly reports to identify campus problem zones.
* **Automated Triage (AI):** Basic keyword recognition to automatically route tickets to the correct department (e.g., "broken pipe" goes directly to Facilities).
* **SLA Alerts:** Automated email notifications to department heads if a critical ticket remains unresolved for more than 48 hours.
