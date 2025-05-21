import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdminService } from '@shared/schema';
import { Pencil, Trash2, Loader2, Info } from 'lucide-react';

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <p className="ml-2 text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-md p-4 text-center">
        <Info className="h-12 w-12 text-gold mb-4" />
        <h3 className="text-xl font-semibold text-gold-darker">No Services Found</h3>
        <p className="text-muted-foreground mt-1">
          There are currently no services to display. Try adding a new service.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name (EN)</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.nameEn || 'Unnamed Service'}</TableCell>
              <TableCell>{service.category || 'Uncategorized'}</TableCell>
              <TableCell className="text-right">EUR {(service.price || 0).toFixed(2)}</TableCell>
              <TableCell className="text-center">{service.duration || 0} min</TableCell>
              <TableCell className="text-center">
                <Badge variant={service.isActive ? 'default' : 'outline'} 
                       className={service.isActive ? 'bg-green-500 text-white hover:bg-green-600' : 'border-destructive text-destructive'}>
                  {service.isActive ? 'Active' : 'Inactive'}
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
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(service.id)}
                  className="hover:text-destructive h-8 w-8 ml-1"
                  // disabled={isDeleting === service.id}
                >
                  {/* {isDeleting === service.id ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Trash2 className="h-4 w-4" />
                  } */}
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
