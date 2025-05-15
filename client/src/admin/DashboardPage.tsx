import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { fetchAdminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CircleEllipsis } from 'lucide-react';
import {
  CalendarDays,
  Check,
  Clock,
  PackageOpen,
  Users,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface DashboardSummary {
  totalBookings: number;
  confirmed: number;
  pending: number;
  servicesCount: number;
  blockedSlotsCount: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await fetchAdminAPI<DashboardSummary>('dashboard-summary');
        setSummary(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load dashboard summary', variant: 'destructive' });
      }
    }
    loadSummary();
  }, []);

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-12 w-12 rounded-full border-4 border-gold/30 border-t-gold animate-spin"></div>
      </div>
    );
  }

  // Calculate ratio for visual indicators
  const confirmedRatio = summary.totalBookings > 0 ? (summary.confirmed / summary.totalBookings) * 100 : 0;
  const pendingRatio = summary.totalBookings > 0 ? (summary.pending / summary.totalBookings) * 100 : 0;
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <h1 className="text-xl md:text-2xl font-display font-bold text-gray-800">Dashboard Overview</h1>
        <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse"></div>
        <span className="text-xs md:text-sm text-muted-foreground mt-0.5">Live Data</span>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Total Bookings</span>
            </CardTitle>
            <CardDescription className="text-xs">All-time appointment count</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="text-2xl md:text-3xl font-bold">{summary.totalBookings}</div>
          </CardContent>
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="text-xs text-muted-foreground">Lifetime total</div>
          </CardFooter>
        </Card>
        
        <Card className="border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Confirmed</span>
            </CardTitle>
            <CardDescription className="text-xs">Approved appointments</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="flex flex-col gap-1">
              <div className="text-2xl md:text-3xl font-bold">{summary.confirmed}</div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-green-400 rounded-full" 
                  style={{ width: `${confirmedRatio}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="text-xs text-muted-foreground">{confirmedRatio.toFixed(0)}% of total</div>
          </CardFooter>
        </Card>
        
        <Card className="border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Pending</span>
            </CardTitle>
            <CardDescription className="text-xs">Awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="flex flex-col gap-1">
              <div className="text-2xl md:text-3xl font-bold">{summary.pending}</div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${pendingRatio}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="text-xs text-muted-foreground">{pendingRatio.toFixed(0)}% of total</div>
          </CardFooter>
        </Card>
        
        <Card className="border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-beige-light/30 to-white">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <PackageOpen className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Services</span>
            </CardTitle>
            <CardDescription className="text-xs">Active spa treatments</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="text-2xl md:text-3xl font-bold">{summary.servicesCount}</div>
          </CardContent>
          <CardFooter className="pt-0 px-4 pb-4">
            <div className="text-xs text-muted-foreground">Available treatments</div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="md:col-span-2 border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Booking Activity</span>
            </CardTitle>
            <CardDescription className="text-xs">At a glance</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="h-[120px] md:h-[160px] flex items-center justify-center">
              <div className="text-center text-sm text-gray-500">
                <CircleEllipsis className="h-8 w-8 md:h-10 md:w-10 text-gold/40 mx-auto mb-2" />
                <p className="text-sm">Booking chart will appear here</p>
                <p className="text-xs mt-1">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gold/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-1 md:pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 text-pink-dark">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-gold flex-shrink-0" />
              <span>Blocked Slots</span>
            </CardTitle>
            <CardDescription className="text-xs">Unavailable periods</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2">
            <div className="text-2xl md:text-3xl font-bold">{summary.blockedSlotsCount}</div>
            <div className="flex justify-between items-center mt-4 md:mt-6 text-sm">
              <div className="text-xs md:text-sm text-muted-foreground">Manage</div>
              <a 
                href="/admin/blocked-slots" 
                className="text-xs md:text-sm text-gold hover:text-gold-dark transition-colors duration-200"
              >
                View →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
