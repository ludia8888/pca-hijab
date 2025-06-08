# PCA-HIJAB Frontend

A mobile-optimized web application built with React + TypeScript + Vite.

## 🛠 Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Code Quality**: ESLint, Prettier

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs on http://localhost:5173 by default.

### Production Build

```bash
npm run build
```

Build artifacts are generated in the `dist` folder.

## 📁 Project Structure

```
src/
├── components/         # Reusable components
│   ├── ui/            # Basic UI components (Button, Card, etc.)
│   ├── layout/        # Layout components (Header, PageLayout, etc.)
│   └── forms/         # Form components (ImageUpload, etc.)
├── pages/             # Route-specific page components
├── services/          # API communication logic
├── store/             # Zustand state management
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles
```

## 🔧 Available Scripts

```bash
# Run development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# TypeScript type checking
npm run typecheck

# Run ESLint
npm run lint

# Code formatting
npm run format

# Run tests
npm test

# Test coverage
npm run test:coverage
```

## 🎨 Design System

### Colors

- Primary: `#FF6B6B` (Coral Pink)
- Secondary: `#4ECDC4` (Mint)
- Success: `#10B981`
- Error: `#EF4444`
- Gray Scale: `gray-50` ~ `gray-900`

### Typography

- Font: Pretendard
- Sizes: `text-xs` ~ `text-h1`
- Weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### Spacing

- `spacing-xs`: 0.25rem
- `spacing-sm`: 0.5rem
- `spacing-md`: 0.75rem
- `spacing-lg`: 1rem
- `spacing-xl`: 1.5rem
- `spacing-2xl`: 2rem

## 🔐 Environment Variables

Create a `.env` file and set the following variables:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_IMAGE_COMPRESSION_QUALITY=0.8
VITE_MAX_IMAGE_SIZE=5242880
```

## 📱 Mobile Optimization

- Minimum touch target size: 44px × 44px
- Safe area padding applied
- Scroll performance optimization
- Image lazy loading
- Privacy-first photo handling

## 🧪 Code Quality

### ESLint Configuration

Uses TypeScript and React recommended rules. Check custom rules in `eslint.config.js`.

### TypeScript Configuration

Strict mode is enabled. Minimize use of `any` for type safety.

## 🤝 Development Guide

### Component Writing

```tsx
// Use functional components with TypeScript
const MyComponent = ({ prop }: MyComponentProps): JSX.Element => {
  return <div>{prop}</div>;
};
```

### State Management

```tsx
// Zustand store usage example
const { data, setData } = useAppStore();
```

### API Calls

```tsx
// Using services/api
const result = await analyzeImage(file);
```

## 🚨 Important Notes

- Don't commit `node_modules` and `dist` folders
- Set environment variables referring to `.env.example`
- Run `npm run lint` and `npm run typecheck` before committing
- User photos are processed locally and never stored