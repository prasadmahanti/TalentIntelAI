import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import LoginPage from './pages/LoginPage.jsx';

// Lazy-load pages so the initial bundle stays small. Heavy libraries (PDF.js, recharts, jsPDF)
// only download when the user actually visits the page that uses them.
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.jsx'));
const MatchPage = lazy(() => import('./pages/MatchPage.jsx'));
const RankingsPage = lazy(() => import('./pages/RankingsPage.jsx'));
const SuggestionsPage = lazy(() => import('./pages/SuggestionsPage.jsx'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage.jsx'));
const CandidatesPage = lazy(() => import('./pages/CandidatesPage.jsx'));
const RolesPage = lazy(() => import('./pages/RolesPage.jsx'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/match" element={<MatchPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
