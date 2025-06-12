# CLAUDE.md - PCA-HIJAB Project Guide

## 🎯 Project Overview
- **Project Name**: PCA-HIJAB - AI Personal Color Analysis for Hijab
- **Goal**: AI-powered personal color diagnosis for hijab color recommendations
- **Target**: 18-35 year old hijab-wearing women (Instagram users)
- **Core Value**: Personalized color recommendations to support purchase decisions
- **Current Version**: 3.0 (January 2025)
- **Live Demo**: https://pca-hijab.vercel.app
- **Last Updated**: 2025-01-13

## 🛠 Tech Stack
### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + CSS Modules
- Zustand (state management)
- React Query (server state)
- React Router v6

### Backend
- AI API: ShowMeTheColor (FastAPI, port 8000)
- Backend API: Express.js + TypeScript (port 5001)
- Database: In-memory storage (PostgreSQL ready)
- Admin Panel: API key authentication

## 📁 Project Structure
```
pca-hijab/
├── frontend/          # React application
├── backend/           # Express.js backend API
├── ShowMeTheColor/    # AI API (FastAPI)
└── docs/             # Documentation
```

## 🚀 Common Commands

### Frontend
```bash
# Start development server
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Type check
cd frontend && npm run typecheck

# Lint
cd frontend && npm run lint

# Test
cd frontend && npm test
```

### Backend (Express API)
```bash
# Start development server
cd backend && npm run dev

# Production start
cd backend && npm start

# Test
cd backend && npm test
```

### ShowMeTheColor API
```bash
# Start API
cd ShowMeTheColor/src && python api.py

# or
cd ShowMeTheColor/src && uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## 📝 Coding Conventions

### Naming Conventions
- **Components**: PascalCase (e.g., `PersonalColorResult.tsx`)
- **Functions/Variables**: camelCase (e.g., `analyzeImage`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase + suffix (e.g., `ButtonProps`, `UserData`)
- **File names**: PascalCase for components, camelCase for utilities

### Component Structure
```typescript
// 1. imports
// 2. types/interfaces
// 3. component
// 4. styles (if needed)
// 5. exports
```

### Props Naming
- Event handlers: `on` + action (e.g., `onClick`, `onSubmit`)
- Boolean: `is/has/can` + adjective (e.g., `isLoading`, `hasError`)
- Child elements: `children`

## 🏗 Architecture Patterns

### State Management
1. **Global State** (Zustand): User session, diagnosis results
2. **Server State** (React Query): API data, caching
3. **Local State** (useState): UI state, form inputs

### Component Design
1. **Container/Presentational Pattern**: Separate logic and UI
2. **Compound Components**: Complex component composition
3. **Custom Hooks**: Reusable logic abstraction

### API Integration
```typescript
// services/api/personalColor.ts
class PersonalColorAPI {
  private baseURL = process.env.VITE_AI_API_URL || 'http://localhost:8000';
  
  async analyzeImage(file: File): Promise<PersonalColorResult> {
    // implementation
  }
}
```

## 🎨 Design System

### Colors
- Primary: `#FF6B6B` (Coral Pink)
- Secondary: `#4ECDC4` (Mint)
- Gray Scale: Gray 50-900
- Semantic: Success, Warning, Error, Info

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Touch Targets
- Minimum size: 44px × 44px
- Spacing: minimum 8px

## 📱 Mobile Optimization Checklist
- [ ] Touch target size check (44px)
- [ ] Image lazy loading
- [ ] Font preload
- [ ] Code splitting
- [ ] PWA support

## 🧪 Testing Strategy
1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: API integration tests
3. **E2E Tests**: Cypress (optional)
4. **Performance Tests**: Lighthouse CI

## 📊 Success Metrics
### Technical Metrics
- Page load: < 3 seconds
- AI analysis: < 30 seconds
- Lighthouse score: > 90

### Business Metrics
- Flow completion rate: > 40%
- Recommendation request rate: > 60%
- Share rate: > 20%

## 🚨 Key Risks and Mitigation
1. **AI API Delay**: 30-second timeout, retry logic
2. **Image Upload Failure**: Client compression, 10MB limit
3. **Mobile Performance**: Code splitting, image optimization
4. **CORS Issues**: Configured for multiple origins (3000, 5173, 5174)
5. **Session Management**: In-memory storage for development

## 📌 Important Notes
- ShowMeTheColor API should not be modified (use api_simple.py for stability)
- Mobile-first design approach
- Recommendation results sent via Instagram DM
- Minimal personal information collection
- Admin panel accessible at `/admin/login` (API Key: dev-admin-key-123 for development)
- Admin UI is fully localized in Korean

## 🔗 Key Documentation
- [Development Plan](./development_plan.md)
- [Main Product Requirements](./hijab_personal_color_prd.md)
- [Design System](./design_system.md)
- [Screen Specifications](./screens_specification.md)
- [API Technical Documentation](./API_TECHNICAL_DOCUMENTATION.md)

## 🐛 Debugging Tips
1. AI API connection failure: Check CORS settings and ensure x-api-key header is allowed
2. Image upload failure: Check file size and format
3. Style issues: Check Tailwind purge settings
4. Admin access issues: Verify ADMIN_API_KEY environment variable
5. Session errors: Backend restart clears in-memory data
6. Personal color data format: Ensure season/tone fields match backend expectations
7. Debug mode: Use DebugInfo component to view current state

## 🔧 Prompt: "Write Code with *Minimum* Bug Risk – 7-Step Engineering Playbook"

> **Context**  
> You are coding a new feature. Your top priority is to **reduce the probability of introducing bugs**. Apply the following evidence-based strategies, which combine *systemic thinking, practical tooling, and collaborative process*.

---

### 1 ️⃣  Design & Build in Small Pieces  *(Modularization + Single-Responsibility)*
- **Principle** High complexity ⇒ exponential bug risk. Cohesion↑ & Coupling↓ ⇒ errors↓.  
- **Rules** One function = one job, keep it ≤ 10 – 30 lines.  
  Layer complex flows (e.g., `handler → service → logic → utils`).

### 2 ️⃣  Write Tests First (TDD) or at Least Unit Tests
- **Evidence** Google's 15-year study: higher coverage slashes maintenance cost.  
- **Do** For every core behavior add a test (`pytest`, `unittest`, `jest`, `vitest`).  
  Always test side-effects (DB, files).

### 3 ️⃣  Use Static Analysis (Lint + Type Check)
- **Why** Machines catch repetitive human mistakes instantly.  
- **Tools**  
  - *Python*: `mypy`, `ruff`, `flake8`  
  - *JS/TS*: `eslint`, `prettier`, `typescript --strict`  
  Auto-run in IDE (`.vscode/settings.json` or Cursor).

### 4 ️⃣  Commit Small & Often  *(Git + Branch Strategy)*
- Track history; use `git blame / bisect` to locate bugs fast.  
- Create feature-scoped branches (`feature/color-detection`).  
- Commit messages explain **why**, not just **what**.

### 5 ️⃣  Enforce Code Review / Rubber-Duck Routine
- Explaining code exposes hidden logic flaws.  
- Describe the flow to ChatGPT, a teammate, or an imaginary duck before merging.  
- Ask yourself: "Can I clearly justify this design?"

### 6 ️⃣  Prefer Logging over Ad-hoc Debugging  *(Observability)*
- Post-deploy debugging is harder than pre-deploy insight.  
- Set log levels (`INFO | DEBUG | ERROR`).  
- Log entry/exit of key paths & failure conditions  
  (*Python*: `logging`, *JS*: `winston`, `loglevel`).

### 7 ️⃣  Specification-Driven Coding (Explicit I/O Contracts)
- Define input → process → output **before** implementation.  
- Use type hints / interfaces to freeze those contracts (`Dict[str, Any]` → precise types).  
- Apply to APIs, models, DB schemas alike.

---

#### ✳️ Bonus – Use AI Tools, but Verify
Copilot, Cursor, ChatGPT = pattern engines ~70-80 % accurate.  
Double-check DB logic, async flows, edge cases.  
Always ask: "*Why did I choose this solution?*"
---
*This document was created to help Claude better understand and assist with the project.*
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context or otherwise consider it in your response unless it is highly relevant to your task. Most of the time, it is not relevant.