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
- **Typography**: Custom fonts (Playfair Display, Noto Sans)

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
│   ├── ui/            # Basic UI components (Button, Card, Input, etc.)
│   ├── layout/        # Layout components (Header, PageLayout)
│   ├── forms/         # Form components (ImageUpload, CameraCapture, CameraInput)
│   ├── auth/          # Authentication components (ProtectedAdminRoute)
│   └── ErrorBoundary/ # Error handling component
├── pages/             # Route-specific page components
│   ├── HomePage/      # Landing page
│   ├── AnalysisPage/  # Photo analysis flow
│   ├── ResultPage/    # Analysis results display
│   ├── AdminPage/     # Admin dashboard
│   └── NotFoundPage/  # 404 page
├── services/          # API communication logic
│   └── api/           # API modules
│       ├── client.ts          # Axios instance configuration
│       ├── personalColor.ts   # AI analysis API
│       ├── recommendation.ts  # Recommendation request API
│       ├── session.ts         # Session management
│       └── admin.ts           # Admin API endpoints
├── store/             # Zustand state management
│   └── useAppStore.ts # Global application state
├── utils/             # Utility functions
│   ├── colorData.ts           # Season color palettes
│   ├── seasonData.ts          # Comprehensive season data
│   ├── resultCardEnhanced.ts  # Enhanced result card generator
│   ├── resultCardGeneratorV3.ts # V3 result card generator
│   ├── resultCardMobile.ts    # Mobile-optimized result cards
│   ├── fontLoader.ts          # Custom font loading
│   ├── imageConverter.ts      # Image format conversion
│   ├── camera.ts             # Camera utilities
│   ├── validators.ts         # Input validation
│   └── constants.ts          # App constants
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
- Season Gradients:
  - Spring: Soft pink to peach
  - Summer: Lavender to pink
  - Autumn: Bisque to peach puff
  - Winter: Alice blue to lavender

### Typography

- Primary Font: Pretendard (UI)
- Display Font: Playfair Display (Headers)
- Secondary Font: Noto Sans (Body text)
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
# Backend API URL
VITE_API_BASE_URL=http://localhost:5001

# AI Service URL (ShowMeTheColor API)
VITE_AI_API_URL=http://localhost:8000

# Image processing
VITE_IMAGE_COMPRESSION_QUALITY=0.8
VITE_MAX_IMAGE_SIZE=5242880

# Feature flags
VITE_USE_MOCK_AI=false
VITE_ENABLE_DEMO_MODE=true
```

## 📱 Mobile Optimization

- Minimum touch target size: 44px × 44px
- Safe area padding applied
- Scroll performance optimization
- Image lazy loading
- Privacy-first photo handling
- Instagram story optimized result cards (1080x1920)

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
// Personal Color Analysis
import { PersonalColorAPI } from '@/services/api';
const result = await PersonalColorAPI.analyzeImage(file);

// Recommendation Request
import { RecommendationAPI } from '@/services/api';
const recommendation = await RecommendationAPI.createRecommendation({
  personalColorResult: result,
  instagramId: '@username'
});

// Admin APIs
import { AdminAPI } from '@/services/api';
const stats = await AdminAPI.getStatistics(apiKey);
const recommendations = await AdminAPI.getRecommendations(apiKey, { status: 'pending' });
```

## 🎬 Result Card Features

### Beautiful Korean-Inspired Design
- Gradient backgrounds matching personal color seasons
- Premium typography with serif headers
- Comprehensive beauty recommendations
- Instagram story optimized (1080x1920px)

### Included Information
- Personal color season with keywords
- Best hijab color palette
- Makeup recommendations (lips, eyes, blush)
- Signature perfume suggestions
- Jewelry metal preferences
- Atmospheric descriptions
- Date stamp and Instagram handle

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your production backend URL
   - `VITE_AI_API_URL`: Your AI service URL
   - Other environment variables as needed

### Manual Build for Static Hosting

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist folder to any static hosting service
```

## 🚨 Important Notes

- Don't commit `node_modules` and `dist` folders
- Set environment variables referring to `.env.example`
- Run `npm run lint` and `npm run typecheck` before committing
- User photos are processed locally and never stored
- CORS must be configured on backend for production deployment
- Ensure HTTPS is used in production for camera access

## 📚 Additional Documentation

- [API Reference](./API_REFERENCE.md) - Detailed API endpoint documentation
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to the project
- [Main Project Documentation](../CLAUDE.md) - Overall project guidelines