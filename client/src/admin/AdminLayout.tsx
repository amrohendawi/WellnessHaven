import React, { useEffect, useState, useRef } from 'react';
import { Switch, Route, Link, useLocation } from 'wouter';
import { useAuth, SignIn } from '@clerk/clerk-react';
import DashboardPage from './DashboardPage';
import BookingsPage from './BookingsPage';
import BookingDetailPage from './BookingDetailPage';
import AvailabilityPage from './AvailabilityPage';
import ServicesPage from './ServicesPage';
import LoginPage from './LoginPage';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Icons
import { Home, Calendar, Clock, Package, LogOut, ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const [location, setLocation] = useLocation();
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-beige-light">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-pink-dark/20"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in directly if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-beige-light">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-gold">Dubai</span> 
            <span className="text-pink-dark">Rose</span>
          </h1>
          <h2 className="text-lg text-gray-700">Admin Dashboard</h2>
          <div className="mt-2 h-1 w-16 bg-gold/50 mx-auto rounded-full"></div>
        </div>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl border border-gold/10">
          <SignIn redirectUrl="/admin/dashboard" signUpUrl="/admin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-beige-light/30 relative">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" />
      )}
      
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
          <Avatar className="h-8 w-8 ring-1 ring-gold/20">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-gold/10 text-gold-dark text-xs">
              {user?.firstName?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      {/* Sidebar */}
      <nav 
        ref={sidebarRef}
        className={cn(
          // Base styling
          "bg-white border-r border-gold/10 flex flex-col shadow-lg z-40 transition-all duration-300",
          // Desktop sizing
          "hidden lg:flex",
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile positioning
          mobileOpen ? 'fixed inset-y-0 left-0 w-[280px] flex' : 'hidden'
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
            {collapsed ? <ChevronRight className="h-4 w-4 text-gold" /> : <ChevronLeft className="h-4 w-4 text-gold" />}
          </Button>
        </div>
        
        {/* Admin user info - Only show on desktop if not collapsed, always show on mobile */}
        <div className={cn(
          "p-4 border-b border-pink/5",
          mobileOpen ? "flex items-center gap-3" : collapsed ? "hidden" : "hidden lg:flex lg:items-center lg:gap-3"
        )}>
          <Avatar className="h-10 w-10 ring-2 ring-gold/30 ring-offset-2 ring-offset-white">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-gold/20 text-gold-dark">
              {user?.firstName?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{user?.firstName || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress || ''}</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <ul className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <li>
            <Link href="/admin/dashboard">
              <a className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                location === '/admin/dashboard' ? 'bg-pink-50 text-pink-dark font-medium' : 'text-gray-700 hover:bg-pink-50/50',
                mobileOpen ? "" : collapsed ? "justify-center" : ""
              )} onClick={() => setMobileOpen(false)}>
                <Home className="h-5 w-5 text-gold flex-shrink-0" />
                {(mobileOpen || !collapsed) && <span className="ml-3">Dashboard</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/bookings">
              <a className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                location.startsWith('/admin/bookings') ? 'bg-pink-50 text-pink-dark font-medium' : 'text-gray-700 hover:bg-pink-50/50',
                mobileOpen ? "" : collapsed ? "justify-center" : ""
              )} onClick={() => setMobileOpen(false)}>
                <Calendar className="h-5 w-5 text-gold flex-shrink-0" />
                {(mobileOpen || !collapsed) && <span className="ml-3">Bookings</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/blocked-slots">
              <a className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                location === '/admin/blocked-slots' ? 'bg-pink-50 text-pink-dark font-medium' : 'text-gray-700 hover:bg-pink-50/50',
                mobileOpen ? "" : collapsed ? "justify-center" : ""
              )} onClick={() => setMobileOpen(false)}>
                <Clock className="h-5 w-5 text-gold flex-shrink-0" />
                {(mobileOpen || !collapsed) && <span className="ml-3">Availability</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/services">
              <a className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                location === '/admin/services' ? 'bg-pink-50 text-pink-dark font-medium' : 'text-gray-700 hover:bg-pink-50/50',
                mobileOpen ? "" : collapsed ? "justify-center" : ""
              )} onClick={() => setMobileOpen(false)}>
                <Package className="h-5 w-5 text-gold flex-shrink-0" />
                {(mobileOpen || !collapsed) && <span className="ml-3">Services</span>}
              </a>
            </Link>
          </li>
        </ul>
        
        {/* Sign out button */}
        <div className="p-4 border-t border-pink/5">
          <Button
            variant="ghost"
            className={cn(
              "text-gray-700 hover:bg-pink-50/50 hover:text-pink-dark w-full",
              mobileOpen ? "justify-start" : collapsed ? "justify-center" : "justify-start"
            )}
            onClick={async () => {
              await signOut();
              setLocation('/admin');
              setMobileOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 text-gold flex-shrink-0" />
            {(mobileOpen || !collapsed) && <span className="ml-3">Sign Out</span>}
          </Button>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 p-4 pt-6 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gold/5 p-4 md:p-6 overflow-auto">
          <Switch>
            <Route path="/admin/dashboard" component={DashboardPage} />
            <Route path="/admin/bookings/:id" component={BookingDetailPage} />
            <Route path="/admin/bookings" component={BookingsPage} />
            <Route path="/admin/blocked-slots" component={AvailabilityPage} />
            <Route path="/admin/services" component={ServicesPage} />
          </Switch>
        </div>
      </main>
    </div>
  );
}
