import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { lazy, Suspense } from 'react';

// Lazy load pages for code splitting
const IntroPage = lazy(() => import('@/pages/IntroPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const AnalyzingPage = lazy(() => import('@/pages/AnalyzingPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const RecommendationPage = lazy(() => import('@/pages/RecommendationPage'));
const CompletionPage = lazy(() => import('@/pages/CompletionPage'));

// Loading component
const PageLoader = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">로딩 중...</p>
    </div>
  </div>
);


// Error boundary for routes
const RouteErrorBoundary = (): JSX.Element => (
  <div className="flex items-center justify-center min-h-screen px-4">
    <div className="text-center max-w-md">
      <h1 className="text-h2 font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
      <p className="text-gray-600 mb-8">페이지를 불러오는 중 문제가 발생했습니다.</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mr-4"
      >
        새로고침
      </button>
      <a
        href={ROUTES.HOME}
        className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        홈으로
      </a>
    </div>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: (
      <Suspense fallback={<PageLoader />}>
        <IntroPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.UPLOAD,
    element: (
      <Suspense fallback={<PageLoader />}>
        <UploadPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.ANALYZING,
    element: (
      <Suspense fallback={<PageLoader />}>
        <AnalyzingPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.RESULT,
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResultPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.RECOMMENDATION,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RecommendationPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.COMPLETION,
    element: (
      <Suspense fallback={<PageLoader />}>
        <CompletionPage />
      </Suspense>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);

// Router component
export const Router = (): JSX.Element => {
  return <RouterProvider router={router} />;
};