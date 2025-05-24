import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ServiceGroup } from '@shared/schema';

interface CategoriesTableProps {
  categories: ServiceGroup[];
  onEdit: (category: ServiceGroup) => void;
  onDelete: (categoryId: number) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found. Create one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order</TableHead>
            <TableHead>Name (English)</TableHead>
            <TableHead className="hidden md:table-cell">Slug</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.displayOrder || 0}</TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">
                {category.nameEn || 'Unnamed Category'}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm font-mono">
                {category.slug || ''}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {category.isActive !== false ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(category)}
                    title="Edit Category"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(category.id)}
                    title="Delete Category"
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
