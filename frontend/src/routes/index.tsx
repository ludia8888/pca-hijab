import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';
import { ProtectedAdminRoute } from '@/components/auth/ProtectedAdminRoute';
import RootLayout from '@/components/layout/RootLayout';
import { retryChunkLoad } from '@/utils/chunkErrorHandler';

// Critical pages - load with retry mechanism
const HomePage = lazy(() => retryChunkLoad(() => import('@/pages/HomePage')));
const HIGLandingPage = lazy(() => retryChunkLoad(() => import('@/pages/HIGLandingPage')));
const PhotoGuide = lazy(() => retryChunkLoad(() => import('@/pages/PhotoGuide')));
const DontWorry = lazy(() => retryChunkLoad(() => import('@/pages/DontWorry')));
const UploadPage = lazy(() => retryChunkLoad(() => import('@/pages/UploadPage')));
const AnalyzingPage = lazy(() => retryChunkLoad(() => import('@/pages/AnalyzingPage')));
const ResultPage = lazy(() => retryChunkLoad(() => import('@/pages/ResultPageV2')));
const CompletionPage = lazy(() => retryChunkLoad(() => import('@/pages/CompletionPage')));

// Auth pages - also use retry for better reliability
const LoginPage = lazy(() => retryChunkLoad(() => import('@/pages/LoginPage')));
const SignupPage = lazy(() => retryChunkLoad(() => import('@/pages/SignupPage')));
const ForgotPasswordPage = lazy(() => retryChunkLoad(() => import('@/pages/ForgotPasswordPage')));
const FindAccountPage = lazy(() => retryChunkLoad(() => import('@/pages/FindAccountPage')));
const ResetPasswordPage = lazy(() => retryChunkLoad(() => import('@/pages/ResetPasswordPage')));
const VerifyEmailPage = lazy(() => retryChunkLoad(() => import('@/pages/VerifyEmailPage')));
const TermsOfServicePage = lazy(() => retryChunkLoad(() => import('@/pages/TermsOfServicePage')));
const PrivacyPolicyPage = lazy(() => retryChunkLoad(() => import('@/pages/PrivacyPolicyPage')));

// Main app pages
const ProductsPage = lazy(() => retryChunkLoad(() => import('@/pages/ProductsCatalogPage')));
const ProductDetailPage = lazy(() => retryChunkLoad(() => import('@/pages/ProductDetailPage')));
const ContentDetailPage = lazy(() => retryChunkLoad(() => import('@/pages/ContentDetailPage')));
const MyPage = lazy(() => retryChunkLoad(() => import('@/pages/MyPage')));

// Admin pages
const AdminLoginPage = lazy(() => retryChunkLoad(() => import('@/pages/admin/AdminLoginPage')));
const AdminDashboard = lazy(() => retryChunkLoad(() => import('@/pages/admin/AdminDashboard')));
const AdminRecommendationDetail = lazy(() => retryChunkLoad(() => import('@/pages/admin/AdminRecommendationDetail')));
const AdminProductsListPage = lazy(() => retryChunkLoad(() => import('@/pages/admin/products/AdminProductsListPage')));
const AdminProductFormPage = lazy(() => retryChunkLoad(() => import('@/pages/admin/products/AdminProductFormPage')));
const AdminContentsListPage = lazy(() => retryChunkLoad(() => import('@/pages/admin/contents/AdminContentsListPage')));
const AdminContentFormPage = lazy(() => retryChunkLoad(() => import('@/pages/admin/contents/AdminContentFormPage')));

// Loading component
const PageLoader = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);


// Route guard removed - all routes are now accessible
// const ProductionRouteGuard = ({ children }: { children: React.ReactNode }): JSX.Element => {
//   if (env.isProduction) {
//     return <Navigate to={ROUTES.HOME} replace />;
//   }
//   return <>{children}</>;
// };

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
        path: ROUTES.PHOTOGUIDE,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PhotoGuide />
          </Suspense>
        ),
      },
      {
        path: ROUTES.DONTWORRY,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DontWorry />
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
          <Suspense fallback={<PageLoader />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: '/products/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/content/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContentDetailPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.MYPAGE,
        element: (
          <Suspense fallback={<PageLoader />}>
            <MyPage />
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
        path: '/find-account',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FindAccountPage />
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
      {
        path: '/forgot-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: '/reset-password',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
      {
        path: '/verify-email',
        element: (
          <Suspense fallback={<PageLoader />}>
            <VerifyEmailPage />
          </Suspense>
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
            path: 'products',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminProductsListPage />
              </Suspense>
            ),
          },
          {
            path: 'products/new',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminProductFormPage />
              </Suspense>
            ),
          },
          {
            path: 'products/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminProductFormPage />
              </Suspense>
            ),
          },
          {
            path: 'contents',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminContentsListPage />
              </Suspense>
            ),
          },
          {
            path: 'contents/new',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminContentFormPage />
              </Suspense>
            ),
          },
          {
            path: 'contents/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminContentFormPage />
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
