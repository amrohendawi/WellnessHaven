import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { ServicesPageHeader } from './components/ServicesPageHeader';
import { ServicesTable } from './components/ServicesTable';
import { ServiceFormDialog } from './components/ServiceFormDialog';
import {
  AdminService,
  AdminServiceFormValues,
} from '@shared/schema';

export default function ServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<AdminService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAPI<AdminService[]>('services');
      setServices(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch services', variant: 'destructive' });
      console.error('Fetch services error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddNewServiceClick = () => {
    setCurrentService(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (service: AdminService) => {
    setCurrentService(service);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetchAdminAPI(`services/${serviceId}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Service deleted successfully.' });
      fetchServices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
      console.error('Delete service error:', error);
    }
  };

  const handleCreateSubmit = async (values: AdminServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await fetchAdminAPI<AdminService>('services', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          groupId: values.groupId || null,
          longDescriptionEn: values.longDescriptionEn || null,
          longDescriptionAr: values.longDescriptionAr || null,
          longDescriptionDe: values.longDescriptionDe || null,
          longDescriptionTr: values.longDescriptionTr || null,
          imageLarge: values.imageLarge || null,
        }),
      });
      setIsCreateDialogOpen(false);
      toast({ title: 'Success', description: 'Service created successfully.' });
      fetchServices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create service', variant: 'destructive' });
      console.error('Create service error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: AdminServiceFormValues) => {
    if (!currentService) return;
    setIsSubmitting(true);
    try {
      await fetchAdminAPI<AdminService>(`services/${currentService.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...values,
          groupId: values.groupId || null,
          longDescriptionEn: values.longDescriptionEn || null,
          longDescriptionAr: values.longDescriptionAr || null,
          longDescriptionDe: values.longDescriptionDe || null,
          longDescriptionTr: values.longDescriptionTr || null,
          imageLarge: values.imageLarge || null,
        }),
      });
      setIsEditDialogOpen(false);
      setCurrentService(null);
      toast({ title: 'Success', description: 'Service updated successfully.' });
      fetchServices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update service', variant: 'destructive' });
      console.error('Update service error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(
    service =>
      service.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <ServicesPageHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNewService={handleAddNewServiceClick}
        isLoading={isLoading}
      />

      <ServicesTable
        services={filteredServices}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {isCreateDialogOpen && (
        <ServiceFormDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateSubmit}
          dialogTitle="Add New Service"
          dialogDescription="Fill in the details to create a new service."
          submitButtonText="Create Service"
          isLoadingOnSubmit={isSubmitting}
        />
      )}

      {isEditDialogOpen && currentService && (
        <ServiceFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={open => {
            setIsEditDialogOpen(open);
            if (!open) setCurrentService(null);
          }}
          onSubmit={handleEditSubmit}
          initialValues={currentService}
          dialogTitle="Edit Service"
          dialogDescription={`Update the details for ${currentService.nameEn}.`}
          submitButtonText="Save Changes"
          isLoadingOnSubmit={isSubmitting}
        />
      )}
    </div>
  );
}
