import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ImageIcon } from 'lucide-react';
import {
  AdminServiceFormValues,
  AdminServiceFormSchema,
  defaultAdminServiceFormValues,
} from '@shared/schema';

interface Category {
  value: string;
  label: string;
}

interface ServiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdminServiceFormValues) => Promise<void>;
  initialValues?: Partial<AdminServiceFormValues>;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
  isLoadingOnSubmit: boolean;
}

// Define the steps for the multi-step form
const steps = [
  { id: 'basic-info', title: 'Basic Info' },
  { id: 'translations', title: 'Translations' },
  { id: 'details', title: 'Details & Images' },
  { id: 'short-descriptions', title: 'Short Descriptions' },
  { id: 'long-descriptions', title: 'Full Descriptions' },
];

// Define the steps for the multi-step form

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialValues,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  isLoadingOnSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  // Fetch categories from the API
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Fetch categories when the dialog opens
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/admin/service-groups');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        console.log('Service groups data:', data); // Debug log
        
        // Transform service groups to category format handling multilingual names
        const formattedCategories = data.map((group: any) => {
          // Handle different possible property name formats
          const id = group.id?.toString() || '';
          
          // Handle the case where name might be a multilingual object
          let label = '';
          if (group.nameEn) {
            // Direct property access
            label = group.nameEn;
          } else if (group.name_en) {
            // Snake case property
            label = group.name_en;
          } else if (typeof group.name === 'object' && group.name?.en) {
            // Nested object with language keys
            label = group.name.en;
          } else if (typeof group.name === 'string') {
            // Simple string
            label = group.name;
          }
          
          console.log(`Group ${id}: Label = ${label}`, group); // Debug log with full object
          
          return {
            value: id,
            label: label || `Group ${id}`, // Fallback to prevent empty labels
          };
        });
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  
  const form = useForm<AdminServiceFormValues>({
    resolver: zodResolver(AdminServiceFormSchema),
    defaultValues: initialValues || defaultAdminServiceFormValues,
    mode: 'onChange', // Validate on change for better UX
  });

  // Reset form and step when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialValues || defaultAdminServiceFormValues);
      setCurrentStep(0);
    } else {
      // Reset to default when dialog closes to clear any lingering validation errors from previous open state
      form.reset(defaultAdminServiceFormValues);
    }
  }, [isOpen, initialValues, form]);

  // Navigate to next step
  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Get fields that should be validated for the current step
  const getFieldsForStep = (step: number): (keyof AdminServiceFormValues)[] => {
    switch (step) {
      case 0: // Basic Info
        return ['slug', 'category', 'isActive'];
      case 1: // Translations
        return ['nameEn', 'nameAr', 'nameDe', 'nameTr'];
      case 2: // Details & Images
        return ['price', 'duration', 'imageUrl'];
      case 3: // Short Descriptions
        return ['descriptionEn', 'descriptionAr', 'descriptionDe', 'descriptionTr'];
      case 4: // Long Descriptions
        return ['longDescriptionEn', 'longDescriptionAr', 'longDescriptionDe', 'longDescriptionTr'];
      default:
        return [];
    }
  };

  // Simple form submission handler
  const handleFormSubmit = async (values: AdminServiceFormValues) => {
    try {
      console.log("Form submitted with values:", values);
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was a problem saving your changes. Please try again.");
    }
  };
  
  // Handle manual save button click - actual submission
  const handleSaveClick = () => {
    console.log("Save button clicked");
    // This will be connected to a normal button, not a submit button
    form.handleSubmit(handleFormSubmit)();
  };

  // Show validation errors
  const showValidationErrors = () => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors);
    
    if (errorFields.length > 0) {
      // Create a readable list of missing fields
      const fieldNames = errorFields.map(field => {
        // Convert camelCase to readable format
        return field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      }).join(', ');
      
      // Use browser alert for validation errors
      alert(`Please fill in all required fields: ${fieldNames}`);
    }
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Convert the display name to a slug
    const newValue = newCategoryName.trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\-]+/g, '') // Remove non-word chars except hyphens
      .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // Trim hyphens from start
      .replace(/-+$/, ''); // Trim hyphens from end
    
    const newCategory = {
      value: newValue,
      label: newCategoryName.trim(),
    };
    
    setCategories(prev => [...prev, newCategory]);
    form.setValue('category', newValue); // Set the form value to the new category
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };
  
  // Check if current step is valid
  const isCurrentStepValid = () => {
    const fields = getFieldsForStep(currentStep);
    const errors = form.formState.errors;
    
    return !fields.some(field => errors[field]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[700px] overflow-y-auto max-h-[90vh] px-6 py-6">
        <DialogHeader className="space-y-2 pb-5">
          <DialogTitle className="text-xl font-semibold">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className="flex flex-wrap space-y-0 space-x-2 md:space-x-4 justify-between md:justify-start">
              {steps.map((step, index) => (
                <li key={step.id} className="flex-none md:flex-1">
                  <div 
                    className={cn(
                      "group flex items-center",
                      index !== steps.length - 1 ? "mr-0" : ""
                    )}
                    >
                    <span 
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0",
                        index < currentStep 
                          ? "border-blue-600 bg-blue-600 text-white" 
                          : index === currentStep 
                            ? "border-blue-600 text-blue-600" 
                            : "border-gray-300 text-gray-500"
                      )}
                    >
                          {index < currentStep ? (
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                    </span>
                    <span className="ml-2 text-sm font-medium hidden md:inline">{step.title}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        <Form {...form}>
          {/* No onSubmit handler to prevent automatic form submission */}
          <form 
            onSubmit={(e) => {
              console.log('Form submit event detected');
              // Always prevent default form submission
              e.preventDefault();
              return false;
            }}
            className="space-y-7" 
            id="service-form">
            {/* Step-specific content */}
            <div className="min-h-[250px] max-h-[400px] overflow-y-auto px-1 pb-4">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <FormField
                    name="slug"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="facial-treatment"
                            className="focus-visible:ring-blue-600/30 h-10"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          URL-friendly identifier (lowercase, hyphens)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Category *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {isLoadingCategories
                                  ? 'Loading categories...'
                                  : field.value && categories.find((category) => category.value === field.value)?.label
                                    ? categories.find((category) => category.value === field.value)?.label
                                    : 'Select category'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search category..." />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup heading="Categories">
                                  {isLoadingCategories ? (
                                    <CommandItem key="loading" value="loading">
                                      Loading categories...
                                    </CommandItem>
                                  ) : categories.length === 0 ? (
                                    <CommandItem key="no-categories" value="no-categories">
                                      No categories available
                                    </CommandItem>
                                  ) : (
                                    categories.map((category) => (
                                      <CommandItem
                                        key={category.value}
                                        value={category.value}
                                        onSelect={() => {
                                          form.setValue('category', category.value);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            category.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {category.label}
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => setIsCreatingCategory(true)}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create new category
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        {isCreatingCategory && (
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="New category name"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={handleAddCategory}
                              disabled={!newCategoryName.trim()}
                            >
                              Add
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setNewCategoryName('');
                                setIsCreatingCategory(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="isActive"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm md:col-span-2 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm md:text-base">Active</FormLabel>
                          <FormDescription className="text-xs text-muted-foreground">
                            This service will be visible to customers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Translations/Names */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    name="nameEn"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Facial Treatment"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nameAr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (العربية) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            dir="rtl"
                            placeholder="علاج الوجه"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nameDe"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Deutsch) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Gesichtsbehandlung"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nameTr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Türkçe) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Yüz Bakımı"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Details & Images */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="price"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (EUR) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">
                              EUR
                            </span>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ''}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              className="pl-12 focus-visible:ring-gold/30"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="duration"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ''}
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                              className="pr-12 focus-visible:ring-gold/30"
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">
                              min
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Image URL *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="https://example.com/image.jpg"
                              className="pl-10 focus-visible:ring-gold/30"
                            />
                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="imageLarge"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Large Image URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={field.value || ''} // Ensure controlled component
                              placeholder="https://example.com/large-image.jpg"
                              className="pl-10 focus-visible:ring-gold/30"
                            />
                            <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Short Descriptions */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    name="descriptionEn"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (English) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="A brief description in English"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="descriptionAr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (العربية) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            dir="rtl"
                            placeholder="وصف قصير بالعربية"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="descriptionDe"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (Deutsch) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Kurze Beschreibung auf Deutsch"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="descriptionTr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (Türkçe) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Kısa açıklama Türkçe"
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 5: Long Descriptions */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <FormField
                    name="longDescriptionEn"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description (English)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            value={field.value || ''}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detailed description in English"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="longDescriptionAr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description (العربية)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            value={field.value || ''}
                            rows={3}
                            dir="rtl"
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="وصف مفصل بالعربية"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="longDescriptionDe"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description (Deutsch)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            value={field.value || ''}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ausführliche Beschreibung auf Deutsch"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="longDescriptionTr"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description (Türkçe)</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            value={field.value || ''}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ayrıntılı açıklama Türkçe"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              </div>
            <DialogFooter className="mt-6 gap-2 flex-col sm:flex-row justify-between">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="mr-2"
                  disabled={isLoadingOnSubmit}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="px-5 h-10"
                    disabled={isLoadingOnSubmit || currentStep === 0}
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 h-10"
                    onClick={nextStep}
                    disabled={isLoadingOnSubmit || !isCurrentStepValid()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 h-10"
                    onClick={handleSaveClick}
                    disabled={isLoadingOnSubmit}
                  >
                    {isLoadingOnSubmit ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      submitButtonText
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
