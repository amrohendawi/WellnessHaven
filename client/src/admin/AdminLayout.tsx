import React, { useEffect } from 'react';
import { Switch, Route, Link, useLocation } from 'wouter';
import { useAuth, SignIn } from '@clerk/clerk-react';
import DashboardPage from './DashboardPage';
import BookingsPage from './BookingsPage';
import BookingDetailPage from './BookingDetailPage';
import AvailabilityPage from './AvailabilityPage';
import ServicesPage from './ServicesPage';
import LoginPage from './LoginPage';

export default function AdminLayout() {
  const [location, setLocation] = useLocation();
  const { isLoaded, isSignedIn, signOut } = useAuth();

  // No longer redirecting to sign-in, we'll render the SignIn component directly
  // This comment is preserved to show the change in approach

  // Redirect base /admin to /admin/dashboard
  useEffect(() => {
    if (location === '/admin') {
      setLocation('/admin/dashboard');
    }
  }, [location, setLocation]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show sign-in directly if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SignIn />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li><Link href="/admin/dashboard">Dashboard</Link></li>
          <li><Link href="/admin/bookings">Bookings</Link></li>
          <li><Link href="/admin/blocked-slots">Availability</Link></li>
          <li><Link href="/admin/services">Services</Link></li>
        </ul>
        <button
          className="mt-6 text-red-600"
          onClick={async () => {
            await signOut();
            setLocation('/admin');
          }}
        >
          Sign Out
        </button>
      </nav>
      {/* Main content */}
      <main className="flex-1 p-6">
        <Switch>
          <Route path="/admin/dashboard" component={DashboardPage} />
          <Route path="/admin/bookings/:id" component={BookingDetailPage} />
          <Route path="/admin/bookings" component={BookingsPage} />
          <Route path="/admin/blocked-slots" component={AvailabilityPage} />
          <Route path="/admin/services" component={ServicesPage} />
        </Switch>
      </main>
    </div>
  );
}
