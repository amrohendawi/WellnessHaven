import React, { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Slot {
  id: number;
  date: string;
  time: string;
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    try {
      const data = await fetchAPI<Slot[]>('/admin/blocked-slots');
      setSlots(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load blocked slots',
        variant: 'destructive',
      });
    }
  }

  async function addSlot() {
    try {
      const newSlot = await fetchAPI<Slot>('/admin/blocked-slots', {
        method: 'POST',
        body: JSON.stringify({ date, time }),
      });
      setSlots(prev => [...prev, newSlot]);
      setDate('');
      setTime('');
      toast({ title: 'Added', description: 'Slot blocked.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to block slot', variant: 'destructive' });
    }
  }

  async function removeSlot(id: number) {
    try {
      await fetchAPI(`/admin/blocked-slots/${id}`, { method: 'DELETE' });
      setSlots(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Removed', description: 'Slot unblocked.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove slot', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Availability (Blocked Slots)</h1>
      <div className="flex gap-2">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          type="time"
          className="border p-2 rounded"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
        <Button onClick={addSlot}>Block Slot</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.date}</TableCell>
              <TableCell>{s.time}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => removeSlot(s.id)}>
                  Unblock
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
