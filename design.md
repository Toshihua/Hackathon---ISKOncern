# UI/UX Design Document: ISKOncern

## 1. Design Principles
* **Frictionless:** Forms must be straightforward, requiring minimal typing. 
* **Accessible:** High contrast, mobile-responsive layout for on-the-go reporting.
* **Transparent:** Clear visual indicators for ticket statuses.

## 2. Frontend Framework & Styling
The UI will be built using standard HTML and CSS, leveraging the Bootstrap 5 framework to rapidly implement a responsive grid system, mobile-first layouts, and pre-styled accessible components (buttons, modals, dropdowns).

## 3. Key Screens
### 3.1 Public Portal: Intake Form
* **Layout:** Single-column card centered on the screen (Bootstrap container).
* **Components:**
  * Category Dropdown (`<select>` with Bootstrap styling).
  * Description Text Area (`<textarea>`).
  * File Upload Input (styled file picker for photos).
  * Toggle Switch: "Submit Anonymously".
  * Call-to-Action (CTA): Prominent "Submit Report" button.
* **Post-Submission State:** A success modal displaying the unique Tracking ID and a "Copy Link" button.

### 3.2 Public Portal: Status Tracker & Chat
* **Layout:** Split view (desktop) or stacked (mobile).
* **Top Section:** Ticket metadata (ID, Category, Current Status Badge: Yellow for Pending, Blue for In Progress, Green for Resolved).
* **Bottom Section:** Chat interface resembling standard messaging apps (Reporter messages on the right, Admin messages on the left).

### 3.3 Admin Dashboard
* **Layout:** Sidebar navigation + Main content area.
* **Sidebar:** Links to "All Tickets", "Unassigned", "Resolved", and "Settings".
* **Main Area:** 
  * Data Table (Bootstrap styled) listing tickets with sortable columns (Date, Category, Status).
  * Quick-action dropdowns on each row to instantly change status.
* **Ticket Detail View:** Clicking a row opens a detailed view showing the user's description, attached photos, and the embedded chat system to communicate with the reporter.
