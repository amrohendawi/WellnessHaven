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
import type { ServiceGroup } from '@shared/schema';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CategoriesTableProps {
  categories: ServiceGroup[];
  onEdit: (category: ServiceGroup) => void;
  onDelete: (categoryId: number) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('adminCategoriesTable.noCategories')}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              {t('adminCategoriesTable.tableHeaders.order')}
            </TableHead>
            <TableHead>{t('adminCategoriesTable.tableHeaders.nameEn')}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t('adminCategoriesTable.tableHeaders.slug')}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {t('adminCategoriesTable.tableHeaders.status')}
            </TableHead>
            <TableHead className="text-right">
              {t('adminCategoriesTable.tableHeaders.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.displayOrder || 0}</TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">
                <div className="font-medium">
                  {getLocalizedName(category, language) ||
                    t('adminCategoriesTable.unnamedCategory')}
                </div>
                <div className="text-xs text-muted-foreground md:hidden mt-1">
                  {category.slug || ''}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm font-mono">
                {category.slug || ''}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {category.isActive !== false ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {t('adminCategoriesTable.active')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    {t('adminCategoriesTable.inactive')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(category)}
                    title={t('adminCategoriesTable.editCategory')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(category.id)}
                    title={t('adminCategoriesTable.deleteCategory')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
