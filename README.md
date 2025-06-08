# 🧕 PCA-HIJAB: AI-Powered Personal Color Analysis & Hijab Recommendation Service

A mobile-optimized web service that uses AI to diagnose personal color types and recommend hijab colors tailored to individual users.

## 🚀 Deployment URLs
- **Frontend**: https://pca-hijab.vercel.app (Ready)
- **Backend API**: https://pca-hijab-backend.onrender.com (Ready)
- **AI API**: Local environment only (ShowMeTheColor)

## 🎯 Project Overview

### Key Features
- **AI Personal Color Analysis**: Analyzes facial photos to diagnose Spring/Summer/Autumn/Winter types
- **Custom Color Recommendations**: Suggests suitable colors and colors to avoid based on analysis
- **Hijab Recommendation System**: Personalized hijab recommendations based on preferences
- **Mobile Optimization**: UI/UX optimized for mobile devices
- **Privacy-First Design**: Photos are analyzed instantly and deleted immediately - no storage
- **Beautiful Result Cards**: Korean-inspired aesthetic with comprehensive beauty recommendations

### Tech Stack

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand with persist
- **Server State**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Image Processing**: Browser Canvas API, HEIC to JPEG conversion
- **Typography**: Custom fonts (Playfair Display, Noto Sans) for premium aesthetics
- **Mobile Features**: Camera API integration, Touch optimized UI

#### Backend
- **Main API**: Express.js + TypeScript
- **AI API**: Python FastAPI (ShowMeTheColor)
- **Database**: PostgreSQL with in-memory fallback
- **Deployment**: Render (Backend), Vercel (Frontend)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Python 3.8+ (for backend server)

### Frontend Installation & Setup

```bash
# Clone repository
git clone https://github.com/ludia8888/pca-hijab.git
cd pca-hijab

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview build
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
# Edit .env file

# Run development server (http://localhost:5001)
npm run dev

# Production build
npm run build
npm start
```

## 📱 Main Screens & User Flow

### 1. Intro Screen (`/`)
- Service introduction and Instagram ID input
- Privacy consent with clear photo deletion policy

### 2. Photo Upload (`/upload`)
- Gallery selection or camera capture
- HEIC format support
- Automatic image compression
- Privacy notice about instant analysis and deletion

### 3. AI Analysis (`/analyzing`)
- Real-time progress display
- 5-step analysis animation (~11 seconds)

### 4. Result Screen (`/result`)
- Personal color type (Spring/Summer/Autumn/Winter)
- Recommended color palette (4x1 grid)
- Colors to avoid
- Share results feature
- AI confidence score
- Download beautiful result card with:
  - Season keywords and atmosphere
  - Best hijab colors
  - Makeup palette recommendations
  - Signature scent suggestions
  - Jewelry preferences (gold/silver/rose-gold)

### 5. Hijab Recommendation (`/recommendation`)
- Style preference selection
- Price range setting
- Material and occasion selection
- Additional requests

### 6. Completion Screen (`/completion`)
- DM delivery notice
- Save and share results

## 🔧 Development Commands

```bash
# Run development server
npm run dev

# TypeScript type checking
npm run typecheck

# Run ESLint
npm run lint

# Code formatting
npm run format

# Production build
npm run build

# Preview build
npm run preview

# Run tests
npm test

# Test coverage
npm run test:coverage
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
VITE_API_BASE_URL=http://localhost:5001/api

# For production:
# VITE_AI_API_URL=http://localhost:8000
# VITE_API_BASE_URL=https://pca-hijab-backend.onrender.com/api
```

### Backend (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/pca_hijab

# CORS
CLIENT_URL=http://localhost:5173

# Security
JWT_SECRET=your-jwt-secret-key
```

For ShowMeTheColor API environment variables, refer to `ShowMeTheColor/README.md`.

## 📊 API Endpoints

### Personal Color Analysis
- `POST /api/analyze` - Upload and analyze image
- `GET /api/health` - Server health check

### Session Management
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session info

### Recommendation System
- `POST /api/recommendations` - Request hijab recommendations
- `GET /api/recommendations/:id` - Get recommendation info
- `PUT /api/recommendations/:id/status` - Update recommendation status

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

### 🚧 Future Development Plans

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

- Email: support@hijabcolor.com
- Issue Tracker: [GitHub Issues](https://github.com/ludia8888/pca-hijab/issues)

## 🙏 Acknowledgments

- AI personal color analysis engine: ShowMeTheColor team
- UI/UX design inspiration: Modern mobile design trends
- Amazing libraries from the open source community