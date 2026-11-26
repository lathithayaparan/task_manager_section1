# Task Manager (Section 1)

A full-stack Task Management application built with a **NestJS** REST API backend (`/api`) and a modern **Next.js App Router** frontend (`/web`) featuring **shadcn/ui** components.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (tested on `v20.12.0` and `v24.x`)
- **Package Manager**: `npm` (v10+), `pnpm`, or `yarn`

---

## 2. Project Structure

```text
task-manager/
├── api/          # NestJS REST API backend
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   └── update-task.dto.ts
│   │   │   ├── task.entity.ts
│   │   │   ├── task-status.enum.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   └── tasks.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── web/          # Next.js 15 frontend with shadcn/ui
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/          # Radix UI + shadcn components
│   │   │   ├── task-table.tsx
│   │   │   ├── task-form-dialog.tsx
│   │   │   └── delete-confirm-dialog.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── types/
│   └── package.json
└── README.md
```

---

## 3. Getting Started from a Fresh Clone

### Step 1: Clone the repository
```bash
git clone <your-repository-url>
cd task-manager
```

---

### Step 2: Backend Setup (`/api`)

1. Navigate to the backend directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   Create a `.env` file in `/api` (or copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   *Contents of `.env`:*
   ```env
   PORT=3001
   NODE_ENV=development
   ```

4. Database Setup:
   The backend uses an encapsulated in-memory data store seeded with sample tasks for instant review. No external database servers or SQLite native compiler tools (e.g. `node-gyp`) are needed.

5. Start the backend:
   ```bash
   npm run start:dev
   ```
   The API will be available at: **`http://localhost:3001`**
   - Health check / List tasks: `GET http://localhost:3001/tasks`

---

### Step 3: Frontend Setup (`/web`)

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Variables:
   Create a `.env.local` file in `/web` (or copy `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   *Contents of `.env.local`:*
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```
   The application will be accessible at: **`http://localhost:3000`**

---

## 4. REST API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/tasks` | Retrieve all tasks | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve a single task by ID | `200 OK`, `404 Not Found` |
| `POST` | `/tasks` | Create a new task (validated via DTO) | `201 Created`, `400 Bad Request` |
| `PATCH` | `/tasks/:id` | Update an existing task | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task | `200 OK`, `404 Not Found` |

---

## 5. Decisions

Here are 4 key architectural choices made during development:

1. **In-Memory Storage over SQLite**:
   *Rationale*: While SQLite with Prisma or TypeORM was permitted, native bindings (such as `better-sqlite3` or Prisma binaries) frequently cause compilation errors (`node-gyp`, Visual Studio C++ build tools) across different operating systems. Choosing a clean, encapsulated in-memory service ensures 100% reliability for interviewers cloning the project fresh on any platform, while keeping the repository interface cleanly decoupled so a database ORM can be swapped in seamlessly.

2. **Dual-Layer Validation (Client & Server)**:
   *Rationale*: The frontend provides immediate visual feedback to the user inside dialog inputs before sending network requests. However, the backend treats all incoming HTTP traffic as untrusted, enforcing strict validation using NestJS `ValidationPipe` with `class-validator` and `class-transformer` (`whitelist: true`, `forbidNonWhitelisted: true`). This returns structured `400 Bad Request` responses for invalid payloads.

3. **Unified Error Propagation & Toast Feedback**:
   *Rationale*: Errors from the NestJS API (such as 400 validation messages or 404 resource errors) are normalized by the frontend `api.ts` client into typed `ApiClientError` exceptions. These bubble up to user-friendly **Sonner** toasts and inline field error hints, providing clear feedback on every action.

4. **Radix UI Primitives with Tailwind CSS (shadcn/ui pattern)**:
   *Rationale*: Rather than using heavy runtime CSS-in-JS libraries or bloated component frameworks, we used headless Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-select`) styled with Tailwind CSS. This guarantees high accessibility (focus traps, ARIA roles, keyboard navigation) with minimal bundle size.

---

## 6. How I Used AI

- **Tools Used**: Gemini for initial boilerplate generation, and catching TypeScript type errors during review.
- **What I Changed in the Generated Code**:
  - Refined the DTO validation rules in NestJS to include custom error messages and regex date matching (`YYYY-MM-DD`).
  - Adjusted the frontend status badge styling and dialog state transitions to prevent layout shifts when switching between create and edit modes.
  - Implemented client-side filtering and real-time status count updates to enhance the dashboard experience.
- **Mistake the AI Made and How I Noticed It**:
  - Form inputs often produce "" for optional fields like description or dueDate, which can fail strict backend validation (@IsDateString()) or store blank strings instead of undefined/null.
  -Skipping 404 checks on missing task IDs or forgetting default values like TODO when creating a task.
  -NestJS validation errors can return an array of messages (string[]) or a single string, which can break frontend error displays if the UI assumes only one format.

  - how i noticed and fixed : I noticed the build failure in the terminal output when testing the production build command. I noticed the errors and try to solve it with official documentation and write prompts to the ai ,identify the errors and try to solve it.
