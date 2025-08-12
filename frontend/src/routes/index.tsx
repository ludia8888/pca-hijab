import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { ProtectedAdminRoute } from '@/components/auth/ProtectedAdminRoute';
import RootLayout from '@/components/layout/RootLayout';
import { env } from '@/config/environment';
import { retryChunkLoad } from '@/utils/chunkErrorHandler';

// Lazy load pages for code splitting with retry mechanism
const HomePage = lazy(() => retryChunkLoad(() => import('@/pages/HomePage')));
const HIGLandingPage = lazy(() => retryChunkLoad(() => import('@/pages/HIGLandingPage')));
const UploadPage = lazy(() => retryChunkLoad(() => import('@/pages/UploadPage')));
const AnalyzingPage = lazy(() => retryChunkLoad(() => import('@/pages/AnalyzingPage')));
const ResultPage = lazy(() => retryChunkLoad(() => import('@/pages/ResultPage')));
const CompletionPage = lazy(() => retryChunkLoad(() => import('@/pages/CompletionPage')));

// Auth pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));

// Main app pages
const ProductsPage = lazy(() => import('@/pages/ProductsCatalogPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ContentDetailPage = lazy(() => import('@/pages/ContentDetailPage'));
const MyPage = lazy(() => import('@/pages/MyPage'));

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


// Production route guard - redirects to home if accessed in production
const ProductionRouteGuard = ({ children }: { children: React.ReactNode }): JSX.Element => {
  if (env.isProduction) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <>{children}</>;
};

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
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.LANDING,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HIGLandingPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.DIAGNOSIS,
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
        path: ROUTES.COMPLETION,
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompletionPage />
          </Suspense>
        ),
      },
      // Main app routes
      {
        path: ROUTES.PRODUCTS,
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <ProductsPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: '/products/:id',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <ProductDetailPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: '/content/:slug',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <ContentDetailPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: ROUTES.MYPAGE,
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <MyPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      // Auth routes
      {
        path: '/login',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: '/signup',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <SignupPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <ForgotPasswordPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <ProductionRouteGuard>
            <Suspense fallback={<PageLoader />}>
              <ResetPasswordPage />
            </Suspense>
          </ProductionRouteGuard>
        ),
      },
      {
        path: ROUTES.TERMS_OF_SERVICE,
        element: (
          <Suspense fallback={<PageLoader />}>
            <TermsOfServicePage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PRIVACY_POLICY,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PrivacyPolicyPage />
          </Suspense>
        ),
      },
      {
        path: '/privacy',
        element: <Navigate to={ROUTES.PRIVACY_POLICY} replace />,
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