import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Package, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  id: number;
  slug: string;
  nameEn: string;
  price: number;
}

export default function ServicesPage() {
  // Form schema for create/edit
  const serviceSchema = z.object({ 
    slug: z.string().nonempty('Slug is required').min(3, 'Slug must be at least 3 characters'),
    nameEn: z.string().nonempty('Name is required').min(2, 'Name must be at least 2 characters'), 
    price: z.coerce.number().min(0, 'Price must be 0 or greater') 
  });
  type ServiceFormValues = z.infer<typeof serviceSchema>;
  const createForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), defaultValues: { slug: '', nameEn: '', price: 0 } });
  const editForm = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [current, setCurrent] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    fetchAdminAPI<Service[]>('services')
      .then(data => {
        setServices(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to fetch services', variant: 'destructive' });
        setIsLoading(false);
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

  // Filter services based on search term
  const filteredServices = searchTerm
    ? services.filter(s => 
        s.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
      )
    : services;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Package className="h-5 w-5 md:h-6 md:w-6 text-gold" />
            <span>Services</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage the spa services offered to clients</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search services..." 
              className="pl-9 w-full sm:w-[240px] bg-white/50 focus-visible:bg-white border-gold/20 focus-visible:ring-gold/30" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-white w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-display text-gold-dark flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Service
                </DialogTitle>
                <DialogDescription>
                  Add a new service to your spa offerings. Fill out the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}> 
                <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4 py-2">
                  <FormField name="slug" control={createForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Slug</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., facial-treatment"
                          className="focus-visible:ring-gold/30" 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">This will be used in the URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="nameEn" control={createForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name (English)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Facial Treatment"
                          className="focus-visible:ring-gold/30" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="price" control={createForm.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          className="focus-visible:ring-gold/30" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter className="mt-6 gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button 
                      type="submit" 
                      className="bg-gold hover:bg-gold/90 text-white w-full sm:w-auto"
                      disabled={createForm.formState.isSubmitting}
                    >
                      {createForm.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Service'
                      )}
                    </Button>
                  </DialogFooter>
                </form> 
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Service Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <span></span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-display text-gold-dark flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Service
            </DialogTitle>
            <DialogDescription>
              Update the service details using the form below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 py-2">
              <FormField name="slug" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Slug</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="focus-visible:ring-gold/30" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">This will be used in the URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="nameEn" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name (English)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="focus-visible:ring-gold/30" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="price" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="focus-visible:ring-gold/30" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="mt-6 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-gold hover:bg-gold/90 text-white w-full sm:w-auto"
                  disabled={editForm.formState.isSubmitting}
                >
                  {editForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Services Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 text-gold animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading services...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
                      <Package className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      {searchTerm ? 'No services match your search.' : 'No services found.'}
                      <Button 
                        variant="link" 
                        className="mt-2 text-gold hover:text-gold-dark" 
                        onClick={() => setIsCreateOpen(true)}
                      >
                        Add your first service
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map(service => (
                  <TableRow key={service.id} className="group">
                    <TableCell className="py-3 font-medium">{service.id}</TableCell>
                    <TableCell className="hidden md:table-cell py-3">                       
                      <span className="text-muted-foreground">{service.slug}</span>
                    </TableCell>
                    <TableCell className="py-3 font-medium">{service.nameEn}</TableCell>
                    <TableCell className="py-3 text-right">€{service.price}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setCurrent(service);
                            editForm.reset({
                              slug: service.slug,
                              nameEn: service.nameEn,
                              price: service.price
                            });
                            setIsEditOpen(true);
                          }}
                          className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100"
                        >
                          <Pencil className="h-4 w-4 text-gold-dark" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100"
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete this service?')) return;
                            try {
                              await fetchAdminAPI(`services/${service.id}`, { method: 'DELETE' });
                              setServices(prev => prev.filter(item => item.id !== service.id));
                              toast({ title: 'Success', description: 'Service has been removed', className: 'bg-green-50 border-green-200 text-green-800' });
                            } catch {
                              toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>
      </div>
    </div>
  );
}
