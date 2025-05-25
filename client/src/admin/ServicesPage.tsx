import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { AdminService, AdminServiceFormValues } from '@shared/schema';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceFormDialog } from './components/ServiceFormDialog';
import { ServicesPageHeader } from './components/ServicesPageHeader';
import { ServicesTable } from './components/ServicesTable';

export default function ServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<AdminService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [services, setServices] = useState<AdminService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAPI<AdminService[]>('services');
      setServices(data);
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToFetchServices'),
        variant: 'destructive',
      });
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
    if (!confirm(t('adminServices.deleteConfirmation'))) return;
    try {
      await fetchAdminAPI(`services/${serviceId}`, { method: 'DELETE' });
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.serviceDeleted'),
      });
      fetchServices();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToDeleteService'),
        variant: 'destructive',
      });
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
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.serviceCreated'),
      });
      fetchServices();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToCreateService'),
        variant: 'destructive',
      });
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
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.serviceUpdated'),
      });
      fetchServices();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToUpdateService'),
        variant: 'destructive',
      });
      console.error('Update service error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    // Check service name in all languages
    const nameMatch = 
      (service.nameEn?.toLowerCase() || '').includes(term) ||
      (service.nameAr || '').includes(term) ||
      (service.nameDe?.toLowerCase() || '').includes(term) ||
      (service.nameTr?.toLowerCase() || '').includes(term);
    
    // Check category name (already handled by getCategoryName in the table)
    const categoryMatch = service.category?.toLowerCase().includes(term) || false;
    
    // Check slug
    const slugMatch = (service.slug?.toLowerCase() || '').includes(term);
    
    return nameMatch || categoryMatch || slugMatch;
  });

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
          dialogTitle={t('adminServices.createServiceTitle')}
          dialogDescription={t('adminServices.createServiceDescription')}
          submitButtonText={t('adminServices.createServiceButton')}
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
          initialValues={{
            ...currentService,
            longDescriptionEn: currentService.longDescriptionEn || undefined,
            longDescriptionAr: currentService.longDescriptionAr || undefined,
            longDescriptionDe: currentService.longDescriptionDe || undefined,
            longDescriptionTr: currentService.longDescriptionTr || undefined,
            imageLarge: currentService.imageLarge || undefined,
          }}
          dialogTitle={t('adminServices.editServiceTitle')}
          dialogDescription={`${t('adminServices.editServiceDescription')} ${currentService.nameEn}.`}
          submitButtonText={t('adminServices.saveChangesButton')}
          isLoadingOnSubmit={isSubmitting}
        />
      )}
    </div>
  );
}
