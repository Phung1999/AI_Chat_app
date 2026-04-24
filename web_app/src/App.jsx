import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import ToastContainer from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.default })));
const VideoCallPage = lazy(() => import('./pages/VideoCallPage').then(m => ({ default: m.default })));

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-spinner" />
      <p>Đang tải...</p>
    </div>
  );
}

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
            <Route path="/call/:userId" element={isAuthenticated ? <VideoCallPage /> : <LoginPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;