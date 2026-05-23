# System Design Document (SDD): ISKOncern

## 1. System Architecture
ISKOncern utilizes a standard Client-Server architecture designed for rapid development, reliability, and deployment efficiency. 

## 2. Technology Stack
* **Presentation Layer (Frontend):** HTML5, CSS3 
* **Application Layer (Backend):** C#
* **Data Layer (Database):** Microsoft SQL Server
* **Development Environment:** Microsoft Visual Studio

## 3. Component Design
### 3.1 Presentation Layer (Client)
A web-based interface rendering the intake form and admin dashboard. It communicates with the backend via standard HTTP requests (GET, POST), passing JSON payloads or multipart form data for image uploads.

### 3.2 Application Layer (Server)
The C# backend acts as the core engine. Responsibilities include:
* Exposing RESTful API endpoints for the frontend.
* Handling file uploads and storing media securely.
* Executing business logic for report generation, ID assignment, and status updates.
* Managing the anonymous chat routing.

### 3.3 Data Layer (Database)
Relational structure using SQL Server to ensure data integrity. 
* **Users Table:** Admin credentials and roles.
* **Tickets Table:** Report ID, category, description, media path, status, timestamp, anonymity flag.
* **ChatLogs Table:** Linked to Ticket ID, containing message payloads and sender tags (Admin vs. Reporter).

## 4. User Flows
### 4.1 Reporter Flow
1. Access web portal -> Fill intake form -> Choose submission type (Anonymous/Named).
2. Backend generates unique Report Tracking ID.
3. System returns Tracking ID and secure URL for future status checks and chat.

### 4.2 Admin Flow
1. Authenticate into dashboard -> View/Filter queue.
2. Select ticket -> Update status (e.g., "In Progress").
3. Use integrated chat to ping reporter if needed -> Toggle to "Resolved" upon completion.
