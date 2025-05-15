import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import type { Booking } from '@shared/schema';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await fetchAdminAPI<Booking[]>('bookings');
      setBookings(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch bookings', variant: 'destructive' });
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetchAdminAPI(`bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
      toast({ title: 'Updated', description: 'Booking status updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bookings</h1>
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
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
                        <Button size="sm">View</Button>
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
