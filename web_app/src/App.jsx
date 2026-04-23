import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import VideoCallPage from './pages/VideoCallPage';

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
        <Route path="/call/:userId" element={isAuthenticated ? <VideoCallPage /> : <LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #f0f0f0',
    borderTopColor: '#075E54',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default App;