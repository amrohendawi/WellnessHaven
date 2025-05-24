import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderTree, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAdminAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServiceGroup } from '@shared/schema';
import { CategoriesTable } from '@/admin/components/CategoriesTable';
import { CategoryFormDialog } from '@/admin/components/CategoryFormDialog';

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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAPI<ServiceGroup[]>('service-groups');
      setCategories(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
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
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await fetchAdminAPI(`service-groups/${categoryId}`, {
        method: 'DELETE',
      });
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
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
      toast({ title: 'Success', description: 'Category created successfully' });
      setIsCreateDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
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
      toast({ title: 'Success', description: 'Category updated successfully' });
      setIsEditDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
      console.error('Update category error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    category =>
      (category.nameEn?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (category.nameDe?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (category.nameAr || '').includes(searchTerm) ||
      (category.nameTr?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (category.slug?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage service categories and their translations</p>
        </div>
        <Button onClick={handleAddNewCategoryClick} className="md:self-end">
          <Plus className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-gold" />
            Service Categories
          </CardTitle>
          <CardDescription>
            Categories are used to organize services and help customers find what they're looking
            for
          </CardDescription>
          <div className="mt-2">
            <Input
              placeholder="Search categories..."
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
        dialogTitle="Add New Category"
        dialogDescription="Add a new service category with translations."
        submitButtonText="Create Category"
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
        dialogTitle="Edit Category"
        dialogDescription="Update a service category and its translations."
        submitButtonText="Save Changes"
        isLoadingOnSubmit={isSubmitting}
      />
    </div>
  );
}
