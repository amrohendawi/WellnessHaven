import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import type { Booking } from '@shared/schema';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await fetchAdminAPI<Booking[]>('bookings');
      setBookings(data);
    } catch {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminBookings.failedToFetchBookings'),
        variant: 'destructive',
      });
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetchAdminAPI(`bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminBookings.statusUpdatedSuccess'),
      });
    } catch {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminBookings.failedToUpdateStatus'),
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('adminBookings.title')}</h1>
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder={t('adminBookings.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('adminBookings.allStatusesPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('adminBookings.allStatuses')}</SelectItem>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('adminBookings.tableHeaders.id')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.name')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.email')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.service')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.date')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.time')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.status')}</TableHead>
            <TableHead>{t('adminBookings.tableHeaders.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {useMemo(
            () =>
              bookings
                .filter(
                  b =>
                    b.name.toLowerCase().includes(search.toLowerCase()) ||
                    b.email.toLowerCase().includes(search.toLowerCase())
                )
                .filter(b => (statusFilter === 'all' ? true : b.status === statusFilter))
                .map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.email}</TableCell>
                    <TableCell>{b.service}</TableCell>
                    <TableCell>{b.date}</TableCell>
                    <TableCell>{b.time}</TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={val => updateStatus(b.id, val)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/bookings/${b.id}`}>
                        <Button size="sm">{t('adminBookings.viewButton')}</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )),
            [bookings, search, statusFilter]
          )}
        </TableBody>
      </Table>
    </div>
  );
}
