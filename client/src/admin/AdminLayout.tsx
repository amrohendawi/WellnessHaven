import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Icons
import {
  Home,
  Calendar,
  Clock,
  Package,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Settings,
  User,
} from 'lucide-react';

// Import pages

// Navigation item type
type NavItem = {
  name: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
};

interface User {
  id: string;
  username: string;
  firstName?: string;
  email?: string;
  imageUrl?: string;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id || 'admin',
            username: userData.username || 'admin',
            firstName: userData.firstName || 'Admin',
            email: userData.email,
            imageUrl: userData.imageUrl,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    if (isAuthenticated) {
      fetchCurrentUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Navigation items
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, href: '/admin/dashboard' },
    { name: 'Bookings', icon: Calendar, href: '/admin/bookings' },
    { name: 'Availability', icon: Clock, href: '/admin/availability' },
    { name: 'Services', icon: Package, href: '/admin/services' },
    { name: 'Profile', icon: User, href: '/admin/profile' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  // Set active nav item based on current route
  const navItemsWithActive = navItems.map(item => ({
    ...item,
    active:
      location.pathname === item.href ||
      (item.href !== '/admin' && location.pathname.startsWith(item.href)),
  }));

  // Handle clicks outside sidebar on mobile to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Redirect base /admin to /admin/dashboard
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout('/admin/login');
      if (result?.success && result.redirectTo) {
        navigate(result.redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Error toast is handled by the logout function
    }
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-beige-light">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Will be handled by the ProtectedRoute
  }

  // Make sure the admin layout has rendered properly before showing content
  useEffect(() => {
    console.log(
      'AdminLayout rendered with sidebar position:',
      window.innerWidth > 1024 ? 'Left (Desktop)' : 'Mobile'
    );
  }, [mounted]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-beige-light/30">
      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" />}

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center px-4 h-14 bg-white border-b border-gold/10 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="mr-3"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gold" />
        </Button>

        <h2 className="text-lg font-display font-bold">
          <span className="text-gold">Dubai</span>
          <span className="text-pink-dark">Rose</span>
        </h2>

        <div className="ml-auto">
          {user ? (
            <Avatar className="h-8 w-8 ring-1 ring-gold/20">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback className="bg-gold/10 text-gold-dark text-xs">
                {user.firstName?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8 ring-1 ring-gold/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gold/10 text-gold-dark text-xs">A</AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>

      {/* Sidebar - Always positioned first in the DOM for left placement */}
      <aside
        ref={sidebarRef}
        className={cn(
          // Base styling
          'bg-white border-r border-gold/10 flex flex-col shadow-lg z-40 transition-all duration-300',
          // Desktop sizing
          'hidden lg:block lg:sticky lg:top-0 lg:h-screen',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile positioning
          mobileOpen ? 'fixed inset-y-0 left-0 w-[280px] block' : 'hidden'
        )}
      >
        {/* Sidebar header with logo */}
        <div className="p-4 flex items-center justify-between border-b border-pink/5">
          {(!collapsed || mobileOpen) && (
            <h2 className="text-xl font-display font-bold">
              <span className="text-gold">Dubai</span>
              <span className="text-pink-dark">Rose</span>
            </h2>
          )}

          {/* Mobile close button */}
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden h-8 w-8 rounded-full hover:bg-pink-50"
            >
              <X className="h-4 w-4 text-gold" />
            </Button>
          )}

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 rounded-full hover:bg-pink-50"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-gold" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gold" />
            )}
          </Button>
        </div>

        {/* Admin user info - Only show on desktop if not collapsed, always show on mobile */}
        <div
          className={cn(
            'p-4 border-b border-pink/5',
            mobileOpen
              ? 'flex items-center gap-3'
              : collapsed
                ? 'hidden'
                : 'hidden lg:flex lg:items-center lg:gap-3'
          )}
        >
          <Avatar className="h-10 w-10 ring-2 ring-gold/30 ring-offset-2 ring-offset-white">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-gold/20 text-gold-dark">
              {user?.firstName?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.firstName || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'Administrator'}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1 px-2">
            {navItemsWithActive.map(item => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    item.active
                      ? 'bg-pink-50 text-pink-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    collapsed ? 'justify-center' : 'justify-start'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      item.active ? 'text-pink-600' : 'text-gray-400 group-hover:text-gray-500',
                      !collapsed && 'mr-3'
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign out button */}
        <div className="p-4 border-t border-pink/5">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>

      {/* Main content - Always positioned after sidebar */}
      <main className="flex-1">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-pink-dark">Dubai Rose</h1>
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        {/* Page content */}
        <div className="overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
