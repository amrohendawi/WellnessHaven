import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Service {
  id: number;
  slug: string;
  nameEn: string;
  price: number;
}

export default function ServicesPage() {
  // Form schema for create/edit
  const serviceSchema = z.object({ slug: z.string().nonempty(), nameEn: z.string().nonempty(), price: z.coerce.number().min(0) });
  type ServiceFormValues = z.infer<typeof serviceSchema>;
  const createForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), defaultValues: { slug: '', nameEn: '', price: 0 } });
  const editForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [current, setCurrent] = useState<Service | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminAPI<Service[]>('services')
      .then(setServices)
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to fetch services', variant: 'destructive' });
      });
  }, []);

  // Create handler
  async function onCreate(values: ServiceFormValues) {
    try {
      await fetchAdminAPI<Service>('services', { method: 'POST', body: JSON.stringify(values) });
      setIsCreateOpen(false);
      createForm.reset();
      // refresh list
      const list = await fetchAdminAPI<Service[]>('services'); 
      setServices(list);
      toast({ title: 'Created', description: 'Service created successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create service', variant: 'destructive' });
    }
  }

  // Edit handler
  async function onEdit(values: ServiceFormValues) {
    if (!current) return;
    try {
      await fetchAdminAPI<Service>(`services/${current.id}`, { method: 'PUT', body: JSON.stringify(values) });
      setIsEditOpen(false);
      editForm.reset();
      const list = await fetchAdminAPI<Service[]>('services'); 
      setServices(list);
      toast({ title: 'Updated', description: 'Service updated successfully.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update service', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Service Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button>New Service</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>New Service</DialogTitle></DialogHeader>
          <Form {...createForm}> 
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <FormField name="slug" control={createForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="nameEn" control={createForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (EN)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="price" control={createForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit">Create</Button>
            </form> 
          </Form>
        </DialogContent>
      </Dialog>
      {/* Edit Service Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <span></span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField name="slug" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="nameEn" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (EN)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="price" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit">Save</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.slug}</TableCell>
              <TableCell>{s.nameEn}</TableCell>
              <TableCell>{s.price}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => {
                  setCurrent(s);
                  editForm.reset({ slug: s.slug, nameEn: s.nameEn, price: s.price });
                  setIsEditOpen(true);
                }}>Edit</Button>
                <Button variant="ghost" size="sm" className="ml-2" onClick={async () => {
                  if (!confirm('Delete this service?')) return;
                  try {
                    await fetchAdminAPI(`services/${s.id}`, { method: 'DELETE' });
                    setServices(prev => prev.filter(item => item.id !== s.id));
                    toast({ title: 'Deleted', description: 'Service removed.' });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
                  }
                }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
