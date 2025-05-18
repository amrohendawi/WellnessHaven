import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

interface ServicesPageHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNewService: () => void;
  isLoading?: boolean; // Optional: if adding new service button should be disabled during other operations
}

export const ServicesPageHeader: React.FC<ServicesPageHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddNewService,
  isLoading = false,
}) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-display text-gold-darker tracking-tight">
          Manage Services
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto md:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 h-10 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus-visible:ring-gold/30"
            />
          </div>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="h-10 w-full sm:w-auto">
              Home
            </Button>
          </Link>
          <Button
            onClick={onAddNewService}
            className="bg-gold hover:bg-gold/90 text-black h-10 min-w-[160px] flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={isLoading}
          >
            <Plus className="h-5 w-5" />
            Add New Service
          </Button>
        </div>
      </div>
    </div>
  );
};
