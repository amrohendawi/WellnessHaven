import { CategoriesTable } from '@/admin/components/CategoriesTable';
import { CategoryFormDialog } from '@/admin/components/CategoryFormDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { ServiceGroup } from '@shared/schema';
import { FolderTree, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Category form values type
export interface CategoryFormValues {
  id?: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameDe: string;
  nameTr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionDe?: string;
  descriptionTr?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

// Server-side category structure
interface ServerCategoryFormat {
  id?: number;
  slug: string;
  name: {
    en: string;
    ar: string;
    de: string;
    tr: string;
  };
  description: {
    en?: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

// Default values for new categories
const defaultCategoryFormValues: CategoryFormValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  nameDe: '',
  nameTr: '',
  descriptionEn: '',
  descriptionAr: '',
  descriptionDe: '',
  descriptionTr: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ServiceGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState<ServiceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAPI<ServiceGroup[]>('service-groups');
      setCategories(data);
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToFetchCategories'),
        variant: 'destructive',
      });
      console.error('Fetch categories error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNewCategoryClick = () => {
    setCurrentCategory(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (category: ServiceGroup) => {
    setCurrentCategory(category);

    // Note: The form values will be handled in the CategoryFormDialog component
    // through the initialValues prop. No need to reset a form here.
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (categoryId: number) => {
    if (!window.confirm(t('adminCategories.deleteConfirmation'))) return;

    try {
      await fetchAdminAPI(`service-groups/${categoryId}`, {
        method: 'DELETE',
      });
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.categoryDeleted'),
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToDeleteCategory'),
        variant: 'destructive',
      });
      console.error('Delete category error:', error);
    }
  };

  const handleCreateSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      // Send the form values directly without transformation
      await fetchAdminAPI('service-groups', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.categoryCreated'),
      });
      setIsCreateDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToCreateCategory'),
        variant: 'destructive',
      });
      console.error('Create category error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: CategoryFormValues) => {
    if (!currentCategory) return;
    setIsSubmitting(true);
    try {
      // Send the form values directly without transformation
      await fetchAdminAPI(`service-groups/${currentCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      toast({
        title: t('adminMessages.successTitle'),
        description: t('adminMessages.categoryUpdated'),
      });
      setIsEditDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({
        title: t('adminMessages.errorTitle'),
        description: t('adminMessages.failedToUpdateCategory'),
        variant: 'destructive',
      });
      console.error('Update category error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    // Check category name in all languages
    const nameMatch = 
      (category.nameEn?.toLowerCase() || '').includes(term) ||
      (category.nameAr || '').includes(term) ||
      (category.nameDe?.toLowerCase() || '').includes(term) ||
      (category.nameTr?.toLowerCase() || '').includes(term);
    
    // Check slug
    const slugMatch = (category.slug?.toLowerCase() || '').includes(term);
    
    // Check description in all languages (optional, uncomment if needed)
    // const descMatch = 
    //   (category.descriptionEn?.toLowerCase() || '').includes(term) ||
    //   (category.descriptionAr || '').includes(term) ||
    //   (category.descriptionDe?.toLowerCase() || '').includes(term) ||
    //   (category.descriptionTr?.toLowerCase() || '').includes(term);
    
    return nameMatch || slugMatch; // Add || descMatch if enabling description search
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('adminCategories.title')}</h1>
          <p className="text-muted-foreground">{t('adminCategories.subtitle')}</p>
        </div>
        <Button onClick={handleAddNewCategoryClick} className="md:self-end">
          <Plus className="mr-2 h-4 w-4" /> {t('adminCategories.addNewCategory')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-gold" />
            {t('adminCategories.serviceCategoriesTitle')}
          </CardTitle>
          <CardDescription>{t('adminCategories.serviceCategoriesDescription')}</CardDescription>
          <div className="mt-2">
            <Input
              placeholder={t('adminCategories.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : (
            <CategoriesTable
              categories={filteredCategories}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <CategoryFormDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        initialValues={defaultCategoryFormValues}
        dialogTitle={t('adminCategories.createCategoryTitle')}
        dialogDescription={t('adminCategories.createCategoryDescription')}
        submitButtonText={t('adminCategories.createCategoryButton')}
        isLoadingOnSubmit={isSubmitting}
      />

      {/* Edit Category Dialog */}
      <CategoryFormDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubmit}
        initialValues={
          currentCategory
            ? {
                id: currentCategory.id,
                slug: currentCategory.slug || '',
                nameEn: currentCategory.nameEn || '',
                nameAr: currentCategory.nameAr || '',
                nameDe: currentCategory.nameDe || '',
                nameTr: currentCategory.nameTr || '',
                descriptionEn: currentCategory.descriptionEn || '',
                descriptionAr: currentCategory.descriptionAr || '',
                descriptionDe: currentCategory.descriptionDe || '',
                descriptionTr: currentCategory.descriptionTr || '',
                displayOrder: currentCategory.displayOrder || 0,
                isActive: currentCategory.isActive !== false,
              }
            : defaultCategoryFormValues
        }
        dialogTitle={t('adminCategories.editCategoryTitle')}
        dialogDescription={t('adminCategories.editCategoryDescription')}
        submitButtonText={t('adminCategories.saveChangesButton')}
        isLoadingOnSubmit={isSubmitting}
      />
    </div>
  );
}
