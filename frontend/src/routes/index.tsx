import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { ProtectedAdminRoute } from '@/components/auth/ProtectedAdminRoute';
import RootLayout from '@/components/layout/RootLayout';

// Lazy load pages for code splitting
const HIGLandingPage = lazy(() => import('@/pages/HIGLandingPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const AnalyzingPage = lazy(() => import('@/pages/AnalyzingPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const RecommendationPage = lazy(() => import('@/pages/RecommendationPage'));
const CompletionPage = lazy(() => import('@/pages/CompletionPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminRecommendationDetail = lazy(() => import('@/pages/admin/AdminRecommendationDetail'));

// Loading component
const PageLoader = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);


// Error boundary for routes
const RouteErrorBoundary = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="text-center max-w-md">
      <h1 className="text-h2 font-bold text-gray-900 mb-4">An error occurred</h1>
      <p className="text-gray-600 mb-8">There was a problem loading the page.</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mr-4"
      >
        Refresh
      </button>
      <a
        href={ROUTES.HOME}
        className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: ROUTES.HOME,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.UPLOAD,
        element: (
          <Suspense fallback={<PageLoader />}>
            <UploadPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.ANALYZING,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AnalyzingPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.RESULT,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResultPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.RECOMMENDATION,
        element: (
          <Suspense fallback={<PageLoader />}>
            <RecommendationPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COMPLETION,
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompletionPage />
          </Suspense>
        ),
      },
      // Landing page (original Instagram ID form)
      {
        path: '/landing',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HIGLandingPage />
          </Suspense>
        ),
      },
      // Auth routes
      {
        path: '/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/signup',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SignupPage />
          </Suspense>
        ),
      },
      // Admin routes
      {
        path: '/admin/login',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminLoginPage />
          </Suspense>
        ),
      },
      {
        path: '/admin',
        element: <ProtectedAdminRoute />,
        children: [
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'recommendations/:id',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminRecommendationDetail />
              </Suspense>
            ),
          },
          {
            path: '',
            element: <Navigate to="/admin/dashboard" replace />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to={ROUTES.HOME} replace />,
      },
    ],
  },
]);

// Router component
export const Router = (): JSX.Element => {
  return <RouterProvider router={router} />;
};