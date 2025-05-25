import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedName } from '@/lib/localization';
import type { AdminService, ServiceGroup } from '@shared/schema';
import { Info, Loader2, Pencil, Trash2 } from 'lucide-react';
import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ServicesTableProps {
  services: AdminService[];
  onEdit: (service: AdminService) => void;
  onDelete: (serviceId: string) => void;
  isLoading: boolean;
  // isDeleting: string | null; // To show spinner on specific delete button
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onEdit,
  onDelete,
  isLoading,
  // isDeleting,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  // State for storing category data
  const [categories, setCategories] = useState<Record<string, ServiceGroup>>({});
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await fetch('/api/admin/service-groups');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();

        // Create a mapping of category IDs to category objects
        const categoryMap: Record<string, ServiceGroup> = {};
        data.forEach((group: ServiceGroup) => {
          const id = group.id?.toString() || '';
          if (id) categoryMap[id] = group;
        });

        setCategories(categoryMap);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to get localized category name from ID
  const getCategoryName = (categoryId: string | null | undefined): string => {
    if (!categoryId) return t('adminServices.uncategorized');

    const category = categories[categoryId];
    if (!category) return categoryId;

    // Use getLocalizedName to get the name in the current language
    return getLocalizedName(category, language) || `Category ${categoryId}`;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="ml-2 text-muted-foreground">{t('adminServices.loadingServices')}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-md p-4 text-center">
        <Info className="h-12 w-12 text-gold mb-4" />
        <h3 className="text-xl font-semibold text-gold-darker">
          {t('adminServices.noServicesFound')}
        </h3>
        <p className="text-muted-foreground mt-1">{t('adminServices.noServicesMessage')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">{t('adminServices.tableHeaders.name')}</TableHead>
            <TableHead>{t('adminServices.tableHeaders.category')}</TableHead>
            <TableHead className="text-right">{t('adminServices.tableHeaders.price')}</TableHead>
            <TableHead className="text-center">
              {t('adminServices.tableHeaders.duration')}
            </TableHead>
            <TableHead className="text-center">{t('adminServices.tableHeaders.status')}</TableHead>
            <TableHead className="text-right w-[120px]">
              {t('adminServices.tableHeaders.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map(service => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">
                {getLocalizedName(service, language) || t('adminServices.unnamedService')}
              </TableCell>
              <TableCell>{getCategoryName(service.category)}</TableCell>
              <TableCell className="text-right">EUR {(service.price || 0).toFixed(2)}</TableCell>
              <TableCell className="text-center">
                {service.duration || 0} {t('minutes')}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={service.isActive ? 'default' : 'outline'}
                  className={
                    service.isActive
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'border-destructive text-destructive'
                  }
                >
                  {service.isActive ? t('adminServices.active') : t('adminServices.inactive')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(service)}
                  className="hover:text-gold-dark h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">{t('adminServices.edit')}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(service.id.toString())}
                  className="hover:text-destructive h-8 w-8 ml-1"
                  // disabled={isDeleting === service.id}
                >
                  {/* {isDeleting === service.id ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Trash2 className="h-4 w-4" />
                  } */}
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{t('adminServices.delete')}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
