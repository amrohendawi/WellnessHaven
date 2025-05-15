import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fetchAdminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Booking } from '@shared/schema';

export default function BookingDetailPage() {
  const [match, params] = useRoute('/admin/bookings/:id');
  const [, navigate] = useLocation();
  const bookingId = params?.id;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();
  const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

  useEffect(() => {
    if (!bookingId) return;
    fetchAdminAPI<Booking>(`bookings/${bookingId}`)
      .then(data => {
        setBooking(data);
        setStatus(data.status);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to fetch booking details', variant: 'destructive' });
      });
  }, [bookingId]);

  const updateStatus = async () => {
    if (!booking) return;
    try {
      await fetchAdminAPI(`bookings/${booking.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      setBooking({ ...booking, status });
      toast({ title: 'Updated', description: 'Status updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{booking.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{booking.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{booking.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Service ID</p>
            <p className="font-medium">{booking.service}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{booking.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{booking.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/bookings')}>Back</Button>
        <Button onClick={updateStatus}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
