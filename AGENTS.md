# Automation & AI Agents: ISKOncern

While the MVP relies on manual administrative routing, the future architecture introduces automated "Agents" to scale the platform and reduce administrative overhead.

## 1. Automated Triage Agent (AI Router)
* **Purpose:** To eliminate manual ticket assignment by reading the context of the report and routing it instantly.
* **Functionality:** Utilizes basic keyword recognition and Natural Language Processing (NLP) on the report description. 
* **Example:** If a user submits a ticket with the words "broken pipe" or "water leak," the Triage Agent automatically tags the ticket with `Facilities` and pushes it directly to the Facilities Department queue.

## 2. SLA (Service Level Agreement) Monitor Agent
* **Purpose:** To ensure no ticket falls into a "black hole" and to maintain accountability.
* **Functionality:** A background worker or cron job that continuously scans the SQL Server database for tickets with a "Pending" or "In Progress" status.
* **Action:** If a critical ticket remains unresolved for more than 48 hours, the agent automatically triggers an email escalation to the respective department head.

## 3. Data Analytics Agent
* **Purpose:** To transform reactive reporting data into proactive campus planning insights.
* **Functionality:** Aggregates ticket data (categories, time of day, resolution speed) over time.
* **Output:** Generates automated monthly reports and visual heatmaps indicating campus problem zones, allowing administrators to allocate budget and resources more effectively.
