# Bot Admin — Web Interface User Guide

## Getting Started

### Prerequisites

- Node.js 22+
- A running PostgreSQL database (Supabase) with the Bot Admin schema
- `DATABASE_URL` set in `web/.env.local`

### Running the App

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:3000**. You'll land on the login page — click **Sign in** to enter the dashboard.

---

## Pages & Features

### Dashboard (`/`)

Your home base. Shows four metric cards (companies, projects, tools, blueprints), a project status bar chart, and a recent activity feed.

**Actions:**
- **New Project** — Opens a modal to create a project. Pick a company from the dropdown, enter a name and optional description.
- **Export** — Downloads a `dashboard-summary.csv` with metrics and status distribution.

---

### Companies (`/companies`)

A searchable table of all client companies.

**Actions:**
- **Add Company** — Opens a modal. Name is required; contact info and website are optional.
- **Export** — Downloads a `companies.csv` with all company data.
- **Search** — Type in the search bar to filter the table by company name in real-time.
- **Click a row** — Navigate to the company detail page.

---

### Company Detail (`/companies/[id]`)

Shows the company header with status badge, a table of its projects, and side panels for company info and products/services.

**Actions:**
- **Edit** — Opens a pre-populated modal to update company name, contact details, and website.
- **New Project** — Opens the project creation modal with this company pre-selected (can't be changed).

---

### Project Board (`/projects`)

A kanban-style board with four columns: Planning, In Progress, Review, Completed.

**Actions:**
- **New Project** — Opens a modal with a company dropdown to create a new project.
- **Click a card** — Navigate to the project detail page.

---

### Project Detail (`/projects/[id]`)

Shows a progress stepper, project details grid, assigned tools, and a progress timeline.

**Actions:**
- **Edit** — Opens a pre-populated modal to update the project name, description, status, and target date. Changing status to "Completed" automatically records the completion date.

---

### Tools (`/tools`)

A table of all registered tools with category, project count, and external links.

**Actions:**
- **Add Tool** — Opens a modal. Name is required; category (dropdown), URL, and description are optional.

---

### Blueprints (`/blueprints`)

A card grid of reusable chatbot templates, showing tool and step counts.

**Actions:**
- **New Blueprint** — Opens a modal. Name is required; description is optional.

---

### Settings (`/settings`)

Profile form and notification preferences.

**Actions:**
- **Profile fields** — Type to edit first name, last name, email, and role.
- **Notification toggles** — Click any toggle to switch it on (green) or off (gray).
- **Save Changes** — Click to save. A "Saved!" confirmation appears for 2 seconds.

> Note: Settings are client-side only in this version — they reset on page reload.

---

### Login (`/login`)

Split-screen login page with a hero panel and sign-in form.

**Actions:**
- **Sign in** / **Continue with SSO** — Both redirect to the dashboard.
- **Forgot password?** — Shows an inline message: "Contact your administrator to reset your password."

> Note: Authentication is not enforced in this version. Both buttons navigate directly to the dashboard.

---

## Keyboard Shortcuts

- **Escape** — Close any open modal.
- Click the **dark backdrop** behind a modal to close it.

---

## Data Flow

All data operations use Next.js Server Actions that write directly to the shared PostgreSQL database via Drizzle ORM. Changes are visible to all users immediately after the page revalidates.

| Action | What Happens |
|--------|-------------|
| Create company | Inserts into `companies` table, revalidates `/companies` and `/` |
| Edit company | Updates the row, revalidates `/companies`, `/companies/[id]`, and `/` |
| Create project | Inserts into `projects` with today as start date, revalidates `/projects`, `/companies/[id]`, and `/` |
| Edit project | Updates status/description/target date, auto-sets `completed_date` if status is "completed" |
| Create tool | Inserts into `tools` table, revalidates `/tools` and `/` |
| Create blueprint | Inserts into `blueprints` table, revalidates `/blueprints` and `/` |

---

## CSV Export

The Export button generates a CSV file in-browser (no server round-trip). Values containing commas, quotes, or newlines are properly escaped. The file downloads immediately.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL via Drizzle ORM |
| Icons | lucide-react |
| IDs | nanoid with entity prefixes (`co_`, `pj_`, `tl_`, `bp_`) |
