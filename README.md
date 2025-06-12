# 🧕 PCA-HIJAB: AI-Powered Personal Color Analysis & Hijab Recommendation Service

A mobile-optimized web service that uses AI to diagnose personal color types and recommend hijab colors tailored to individual users.

## 🚀 Live Demo
- **Production App**: https://pca-hijab.vercel.app
- **Backend API**: https://pca-hijab-backend.onrender.com
- **AI API**: Currently requires local setup (see deployment guide for cloud options)

## 🎯 Project Overview

### ✨ Key Features
- **AI Personal Color Analysis**: Analyzes facial photos to diagnose Spring/Summer/Autumn/Winter types
- **Custom Color Recommendations**: Suggests suitable colors and colors to avoid based on analysis
- **Hijab Recommendation System**: Personalized hijab recommendations based on preferences
- **Mobile-First Design**: Optimized for Instagram DM shopping flow
- **Privacy-First Approach**: Photos are analyzed instantly and deleted immediately - no storage
- **Beautiful Result Cards**: Korean-inspired aesthetic with comprehensive beauty recommendations
- **Multi-Language Support**: Currently in English (Korean version available)
- **Fast Analysis**: Optimized to complete in ~11 seconds
- **Admin Dashboard**: Comprehensive admin panel for recommendation management

### Tech Stack

#### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand with persist middleware
- **Server State**: React Query v5 (TanStack Query)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library + MSW
- **Image Processing**: Browser Canvas API, HEIC to JPEG conversion
- **Typography**: Playfair Display + Noto Sans for premium aesthetics
- **Mobile Features**: Camera API, Touch gestures, PWA ready
- **Performance**: Code splitting, lazy loading, Vercel Speed Insights

#### Backend
- **Main API**: Express.js + TypeScript (Port 5000)
- **AI API**: Python FastAPI (ShowMeTheColor - Port 8000)
- **Face Detection**: dlib with 68-point landmarks
- **Color Analysis**: K-means clustering, Lab/HSV color spaces
- **Database**: Dual support - PostgreSQL (production) / In-memory (development)
- **Admin Panel**: Secure admin dashboard with X-API-Key header authentication
- **Deployment**: Render (Backend), Vercel (Frontend)
- **Security**: CORS, Helmet.js, input validation, API key auth

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Python 3.8+ (for backend server)

### Quick Start

```bash
# Clone repository
git clone https://github.com/[your-username]/pca-hijab.git
cd pca-hijab

# Install all dependencies
npm install

# Start all services (requires 3 terminals)
# Terminal 1: Frontend (http://localhost:5173)
cd frontend && npm run dev

# Terminal 2: Backend API (http://localhost:5000)
cd backend && npm run dev

# Terminal 3: AI API (http://localhost:8000)
cd ShowMeTheColor/src && python api.py
```

### Detailed Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Installation & Setup

#### 1. AI API (ShowMeTheColor)
```bash
# Navigate to AI API directory
cd ShowMeTheColor

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server (http://localhost:8000)
cd src
python api.py
```

#### 2. Backend API (Express)
```bash
# Navigate to Backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with:
# PORT=5000
# NODE_ENV=development
# CLIENT_URL=http://localhost:5173
# ADMIN_API_KEY=your-dev-api-key

# Run development server (http://localhost:5000)
npm run dev

# Production build
npm run build
npm start
```

## 📱 Main Screens & User Flow

### 1. Intro Screen (`/`)
- Service introduction with hero image
- Instagram ID input with validation
- Privacy consent with clear photo deletion policy
- Demo mode notice for testing

### 2. Photo Upload (`/upload`)
- Gallery selection or camera capture
- HEIC format auto-conversion (iOS)
- Automatic image compression (max 5MB)
- Privacy notice: "Your photo will be analyzed and immediately deleted"
- Face detection validation

### 3. AI Analysis (`/analyzing`)
- Real-time 5-step progress display:
  1. Detecting face landmarks
  2. Extracting skin tone
  3. Analyzing color harmony
  4. Calculating seasonal type
  5. Generating recommendations
- ~11 seconds total processing time

### 4. Result Screen (`/result`)
- Personal color diagnosis (Spring/Summer/Autumn/Winter)
- AI confidence percentage
- Recommended color palette (interactive 4x1 grid)
- Colors to avoid section
- Downloadable result card (v3) featuring:
  - Seasonal atmosphere keywords
  - Best hijab color recommendations
  - Makeup palette (eyes, lips, cheeks)
  - Signature scent profile
  - Jewelry metal preferences
  - Celebrity style references
- Share functionality (Instagram, WhatsApp, etc.)

### 5. Hijab Recommendation (`/recommendation`)
- Style preferences (Simple, Pattern, Texture, Embellished)
- Price range slider ($10-100+)
- Material selection (Cotton, Chiffon, Silk, Jersey, Modal)
- Occasion tags (Daily, Work, Formal, Special, Travel)
- Free-text additional requests
- Instagram handle confirmation

### 6. Completion Screen (`/completion`)
- Success message with Instagram DM notice
- Recommendation ID for tracking
- Options to:
  - Save result image
  - Share on social media
  - Start new analysis

## 🔧 Development Commands

### Frontend Commands
```bash
# Development server with hot reload
npm run dev

# TypeScript type checking
npm run typecheck

# Linting with auto-fix
npm run lint
npm run lint:fix

# Run tests
npm test
npm run test:ui     # With UI
npm run test:coverage # Coverage report

# Production build
npm run build
npm run preview     # Preview production build
```

### Backend Commands
```bash
# Development with nodemon
npm run dev

# Production build & start
npm run build
npm start

# Database migrations
npm run db:migrate
npm run db:seed
```

### AI API Commands
```bash
# Start FastAPI server
cd ShowMeTheColor/src
uvicorn api:app --reload --host 0.0.0.0 --port 8000

# Or use the simple runner
python api.py
```

## 🏗 Project Structure

```
pca-hijab/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/         # Basic UI components
│   │   │   ├── layout/     # Layout components
│   │   │   └── forms/      # Form components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand global state
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static files
│
├── ShowMeTheColor/         # Python backend
│   ├── src/
│   │   ├── api.py         # FastAPI server
│   │   └── personal_color_analysis/  # AI analysis module
│   └── res/               # Resource files
│
└── docs/                   # Project documentation
```

## 🔒 Environment Variables

### Frontend (.env)
```env
# API Configuration
VITE_AI_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:5000/api

# For production:
# VITE_AI_API_URL=https://pca-hijab-ai.herokuapp.com
# VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
```

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (optional - uses in-memory if not set)
DATABASE_URL=postgresql://user:password@localhost:5432/pca_hijab

# CORS
CLIENT_URL=http://localhost:5173

# Security
ADMIN_API_KEY=your-secure-admin-api-key
```

For ShowMeTheColor API environment variables, refer to `ShowMeTheColor/README.md`.

## 📊 API Documentation

### AI Analysis Endpoints
```typescript
// Health check
GET /health
Response: { status: "healthy", service: "Personal Color Analysis API" }

// Analyze image
POST /analyze
Content-Type: multipart/form-data
Body: { file: File, debug?: boolean }
Response: {
  personal_color: string,      // e.g., "가을 웜톤"
  personal_color_en: string,   // e.g., "autumn"
  tone: string,                // e.g., "웜톤"
  tone_en: string,             // e.g., "warm"
  details: {
    is_warm: number,
    skin_lab_b: number,
    eyebrow_lab_b: number,
    eye_lab_b: number,
    skin_hsv_s: number,
    eyebrow_hsv_s: number,
    eye_hsv_s: number
  },
  facial_colors: {
    cheek: { rgb: number[], lab: number[], hsv: number[] },
    eyebrow: { rgb: number[], lab: number[], hsv: number[] },
    eye: { rgb: number[], lab: number[], hsv: number[] }
  },
  confidence: number           // 0-1 confidence score
}
```

### Backend API Endpoints
```typescript
// Health Check
GET /api/health
Response: { status: string, service: string, timestamp: string, database: string }

// Session Management
POST /api/sessions
Body: { instagramId: string }
Response: { success: boolean, data: { id: string, instagramId: string, createdAt: string } }

// Recommendation System
POST /api/recommendations
Body: {
  sessionId: string,
  instagramId: string,
  personalColorResult: AnalysisResult,
  preferences: {
    styles: string[],
    fabricTypes: string[],
    priceRange: string,
    occasions: string[]
  }
}
Response: { success: boolean, data: { id: string, status: string, createdAt: string } }

// Get Recommendation
GET /api/recommendations/:id
Response: { success: boolean, data: Recommendation }

// Admin Endpoints (requires X-API-Key header)
GET /api/admin/statistics
GET /api/admin/recommendations
GET /api/admin/recommendations/:id
PATCH /api/admin/recommendations/:id/status
```

## 🎨 Recent Updates

### Version 3.0 (December 2024)
- ✅ Complete UI translation to English
- ✅ Mobile-optimized result card redesign with Korean aesthetics
- ✅ 50% faster AI analysis performance
- ✅ Enhanced privacy UX with clear data handling notices
- ✅ Autumn/Fall terminology unification
- ✅ Vercel Speed Insights integration
- ✅ Improved error handling and user feedback
- ✅ Admin dashboard implementation
- ✅ PostgreSQL database support with in-memory fallback
- ✅ CI/CD pipeline configuration

### Version 2.0 Features
- ✅ HEIC to JPEG conversion for iOS
- ✅ Camera capture integration
- ✅ Result card download functionality
- ✅ Social sharing capabilities
- ✅ Responsive design for all screen sizes

## 🚦 Development Status

### ✅ Completed Features
- [x] Project setup and design system
- [x] Complete page flow implementation
- [x] AI API integration and analysis features
- [x] Mobile camera and HEIC support
- [x] Result sharing and saving functionality
- [x] Personalized recommendation input form
- [x] Backend API (Express.js + TypeScript)
- [x] PostgreSQL database support (with in-memory fallback)
- [x] Session management system
- [x] Recommendation request storage and status management
- [x] Result image generation (Canvas API)
- [x] Instagram story format result cards
- [x] Vercel/Render deployment configuration
- [x] Comprehensive test coverage
- [x] Privacy-focused UX with clear data deletion messaging
- [x] Full English UI translation
- [x] Optimized analysis animation (11 seconds)
- [x] Beautiful Korean-inspired result card design
- [x] Comprehensive beauty recommendations (makeup, perfume, jewelry)
- [x] Premium typography with custom fonts

### 🛠️ In Development
- [ ] Cloud deployment for AI API (Google Cloud Run/AWS ECS)
- [ ] Real-time recommendation tracking
- [ ] Multi-language support (Arabic, Malay, Turkish)
- [ ] PWA offline capabilities
- [ ] Advanced color matching algorithm

### 🚀 Future Plans

#### 1. Automated Hijab Product Recommendation System
Currently, recommendation requests are processed manually. Automation needed:
- [ ] Build hijab product database
- [ ] AI-based product matching algorithm
- [ ] Admin dashboard (view requests and manage DM delivery)
- [ ] Instagram API integration (automatic DM sending)

#### 2. PWA (Progressive Web App) Setup
Make it work like a mobile app:
- [ ] Service Worker implementation
- [ ] Offline page support
- [ ] Add to home screen feature
- [ ] Push notifications (DM delivery notifications)

#### 3. Analysis Result Caching
Prevent re-analysis of same images:
- [ ] Local caching with IndexedDB
- [ ] Image hash-based duplicate detection
- [ ] Server-side caching with Redis
- [ ] Cache expiration policies

#### 4. A/B Testing Infrastructure
User behavior analysis and optimization:
- [ ] Google Analytics 4 or Mixpanel integration
- [ ] User behavior event tracking
- [ ] Feature Flag system
- [ ] Conversion rate measurement (completion rate, recommendation request rate)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Message Convention
- `feat:` Add new feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting, missing semicolons, etc.
- `refactor:` Code refactoring
- `test:` Add tests
- `chore:` Build tasks, package manager changes, etc.

## 📝 License

This project is distributed under the MIT License. See `LICENSE` file for details.

## 📞 Contact

- Project Repository: [GitHub](https://github.com/yourusername/pca-hijab)
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/pca-hijab/issues)
- Documentation: [API Docs](./API_TECHNICAL_DOCUMENTATION.md) | [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🙏 Acknowledgments

- **ShowMeTheColor**: Original AI personal color analysis engine
- **Design Inspiration**: Korean beauty apps and Instagram shopping UX
- **Open Source Libraries**: React, FastAPI, dlib, and many more
- **Fonts**: Google Fonts (Playfair Display, Noto Sans)
- **Icons**: Lucide React

---

<p align="center">
  Made with ❤️ for the hijab-wearing community
</p>