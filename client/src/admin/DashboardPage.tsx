import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
        const data = await fetchAPI<DashboardSummary>('/admin/dashboard-summary');
        setSummary(data);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load dashboard summary', variant: 'destructive' });
      }
    }
    loadSummary();
  }, []);

  if (!summary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>{summary.totalBookings}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
          </CardHeader>
          <CardContent>{summary.confirmed}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>{summary.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>{summary.servicesCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocked Slots</CardTitle>
          </CardHeader>
          <CardContent>{summary.blockedSlotsCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
