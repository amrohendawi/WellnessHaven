import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import type { Booking } from '@shared/schema';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useRoute } from 'wouter';

export default function BookingDetailPage() {
  const [_match, params] = useRoute('/admin/bookings/:id');
  const [, navigate] = useLocation();
  const bookingId = params?.id;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<string>('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

  useEffect(() => {
    if (!bookingId) return;
    fetchAdminAPI<Booking>(`bookings/${bookingId}`)
      .then(data => {
        setBooking(data);
        setStatus(data.status);
      })
      .catch(() => {
        toast({
          title: t('adminMessages.errorTitle'),
          description: t('failedToUpdateStatus'),
          variant: 'destructive',
        });
      });
  }, [bookingId, t, toast]);

  const updateStatus = async () => {
    if (!booking) return;
    try {
      await fetchAdminAPI(`bookings/${booking.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setBooking({ ...booking, status });
      toast({ title: t('updated'), description: t('statusUpdated') });
    } catch {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('failedToUpdateStatus'),
        variant: 'destructive',
      });
    }
  };

  if (!booking) {
    return <div>{t('loading')}</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('bookingDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('name')}</p>
            <p className="font-medium">{booking.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('email')}</p>
            <p className="font-medium">{booking.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('phone')}</p>
            <p className="font-medium">{booking.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('serviceId')}</p>
            <p className="font-medium">{booking.service}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('bookingDate')}</p>
            <p className="font-medium">{booking.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('bookingTime')}</p>
            <p className="font-medium">{booking.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">{t('status')}</p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {t(`bookingStatuses.${opt}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
          {t('back')}
        </Button>
        <Button onClick={updateStatus}>{t('updateStatus')}</Button>
      </CardFooter>
    </Card>
  );
}
