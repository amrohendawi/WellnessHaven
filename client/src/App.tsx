import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

// Pages
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import ServiceDetails from '@/pages/ServiceDetails';
import LoginPage from '@/pages/admin/LoginPage';

// Admin Layouts
import AdminLayout from '@/admin/AdminLayout';

// Admin Pages
import DashboardPage from '@/admin/DashboardPage';
import BookingsPage from '@/admin/BookingsPage';
import BookingDetailPage from '@/admin/BookingDetailPage';
import AvailabilityPage from '@/admin/AvailabilityPage';
import ServicesPage from '@/admin/ServicesPage';
import ProfilePage from '@/admin/ProfilePage';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Main Router Component
function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/services/:slug" element={<ServiceDetails />} />

      {/* Auth Routes */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
