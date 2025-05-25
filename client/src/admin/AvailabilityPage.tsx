import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Slot {
  id: number;
  date: string;
  time: string;
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t('adminMessages.errorTitle'),
        description: t('adminAvailability.failedToLoadSlots'),
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
      toast({ 
        title: t('adminMessages.successTitle'), 
        description: t('adminAvailability.slotBlockedSuccess') 
      });
    } catch {
      toast({ 
        title: t('adminMessages.errorTitle'), 
        description: t('adminAvailability.failedToBlockSlot'), 
        variant: 'destructive' 
      });
    }
  }

  async function removeSlot(id: number) {
    try {
      await fetchAPI(`/admin/blocked-slots/${id}`, { method: 'DELETE' });
      setSlots(prev => prev.filter(s => s.id !== id));
      toast({ 
        title: t('adminMessages.successTitle'), 
        description: t('adminAvailability.slotUnblockedSuccess') 
      });
    } catch {
      toast({ 
        title: t('adminMessages.errorTitle'), 
        description: t('adminAvailability.failedToRemoveSlot'), 
        variant: 'destructive' 
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('adminAvailability.title')}</h1>
      <div className="flex gap-2">
        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
          placeholder={t('adminAvailability.datePlaceholder')}
        />
        <input
          type="time"
          className="border p-2 rounded"
          value={time}
          onChange={e => setTime(e.target.value)}
          placeholder={t('adminAvailability.timePlaceholder')}
        />
        <Button onClick={addSlot}>{t('adminAvailability.blockSlotButton')}</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('adminAvailability.tableHeaders.id')}</TableHead>
            <TableHead>{t('adminAvailability.tableHeaders.date')}</TableHead>
            <TableHead>{t('adminAvailability.tableHeaders.time')}</TableHead>
            <TableHead>{t('adminAvailability.tableHeaders.actions')}</TableHead>
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
                  {t('adminAvailability.unblockButton')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
