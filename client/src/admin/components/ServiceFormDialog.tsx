import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
} from '../../../../shared/schema';

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
  const form = useForm<AdminServiceFormValues>({
    resolver: zodResolver(AdminServiceFormSchema),
    defaultValues: initialValues || defaultAdminServiceFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(initialValues || defaultAdminServiceFormValues);
    } else {
      // Reset to default when dialog closes to clear any lingering validation errors from previous open state
      form.reset(defaultAdminServiceFormValues);
    }
  }, [isOpen, initialValues, form]);

  const handleFormSubmit = async (values: AdminServiceFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-4 md:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-display text-gold-dark flex items-center gap-2">
            {/* Icon can be passed as a prop if it needs to change (e.g., Plus for create, Pencil for edit) */}
            {/* <Plus className="h-5 w-5" /> */}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="focus-visible:ring-gold/30"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
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
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., facials"
                        className="focus-visible:ring-gold/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                name="price"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (AED) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-xs">
                          AED
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

              <FormField
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm md:text-base">Active</FormLabel>
                      <FormDescription className="text-xs">
                        This service will be visible to customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-gold"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Description Fields */}
              <div className="md:col-span-2 space-y-3 md:space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Descriptions</h4>

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
            </div>
            <DialogFooter className="mt-6 gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
                disabled={isLoadingOnSubmit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gold hover:bg-gold/90 text-white w-full sm:w-auto"
                disabled={isLoadingOnSubmit || !form.formState.isDirty}
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
