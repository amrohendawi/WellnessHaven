import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CategoryFormValues } from '../CategoriesPage';

// Validation schema for the category form
const CategoryFormSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').toLowerCase(),
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameDe: z.string().min(1, 'German name is required'),
  nameTr: z.string().min(1, 'Turkish name is required'),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionTr: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().int().min(0, 'Order must be a positive number'),
  isActive: z.boolean().default(true),
});

interface CategoryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  initialValues: CategoryFormValues;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
  isLoadingOnSubmit: boolean;
}

export function CategoryFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  initialValues,
  dialogTitle,
  dialogDescription,
  submitButtonText,
  isLoadingOnSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const [nameEnValue, setNameEnValue] = useState(initialValues.nameEn || '');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: initialValues,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialValues);
      setNameEnValue(initialValues.nameEn || '');
    }
  }, [isOpen, initialValues, form]);

  // Auto-generate slug from English name
  useEffect(() => {
    if (!nameEnValue || form.getValues().slug) return;

    const slug = nameEnValue
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    form.setValue('slug', slug);
  }, [nameEnValue, form]);

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNameEnValue(newValue);
    form.setValue('nameEn', newValue);

    // Only auto-generate slug if slug is empty or was auto-generated previously
    if (
      !form.getValues().slug ||
      form.getValues().slug === nameEnValue.toLowerCase().replace(/\s+/g, '-')
    ) {
      const slug = newValue
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      form.setValue('slug', slug);
    }
  };

  const handleFormSubmit = async (values: CategoryFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] md:max-w-[700px] p-4 md:p-6 w-[95vw]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-display text-gold-dark flex items-center gap-2">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info Section */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-base font-semibold">
                  {t('adminCategoryForm.sections.basicInfo')}
                </h3>

                <FormField
                  name="nameEn"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminCategoryForm.fields.nameEn.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={nameEnValue}
                          onChange={handleNameEnChange}
                          placeholder={t('adminCategoryForm.fields.nameEn.placeholder')}
                          className="focus-visible:ring-gold/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="slug"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminCategoryForm.fields.slug.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('adminCategoryForm.fields.slug.placeholder')}
                          className="focus-visible:ring-gold/30"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t('adminCategoryForm.fields.slug.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="displayOrder"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('adminCategoryForm.fields.displayOrder.label')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || 0}
                            onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                            className="focus-visible:ring-gold/30"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t('adminCategoryForm.fields.displayOrder.description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="isActive"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm md:text-base">
                            {t('adminCategoryForm.fields.isActive.label')}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {t('adminCategoryForm.fields.isActive.description')}
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
                </div>

                <FormField
                  name="imageUrl"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminCategoryForm.fields.imageUrl.label')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            value={field.value || ''}
                            placeholder={t('adminCategoryForm.fields.imageUrl.placeholder')}
                            className="pl-10 focus-visible:ring-gold/30"
                          />
                          <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t('adminCategoryForm.fields.imageUrl.description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Translations Section */}
              <div className="md:col-span-2 space-y-4 pt-2">
                <h3 className="text-base font-semibold">
                  {t('adminCategoryForm.sections.translations')}
                </h3>

                <FormField
                  name="nameAr"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminCategoryForm.fields.nameAr.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          dir="rtl"
                          placeholder={t('adminCategoryForm.fields.nameAr.placeholder')}
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
                      <FormLabel>{t('adminCategoryForm.fields.nameDe.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('adminCategoryForm.fields.nameDe.placeholder')}
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
                      <FormLabel>{t('adminCategoryForm.fields.nameTr.label')} *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('adminCategoryForm.fields.nameTr.placeholder')}
                          className="focus-visible:ring-gold/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descriptions Section */}
              <div className="md:col-span-2 space-y-4 pt-2">
                <h3 className="text-base font-semibold">
                  {t('adminCategoryForm.sections.descriptions')}
                </h3>

                <FormField
                  name="descriptionEn"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adminCategoryForm.fields.descriptionEn.label')}</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          value={field.value || ''}
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t('adminCategoryForm.fields.descriptionEn.placeholder')}
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
                      <FormLabel>{t('adminCategoryForm.fields.descriptionAr.label')}</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          value={field.value || ''}
                          rows={2}
                          dir="rtl"
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t('adminCategoryForm.fields.descriptionAr.placeholder')}
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
                      <FormLabel>{t('adminCategoryForm.fields.descriptionDe.label')}</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          value={field.value || ''}
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t('adminCategoryForm.fields.descriptionDe.placeholder')}
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
                      <FormLabel>{t('adminCategoryForm.fields.descriptionTr.label')}</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          value={field.value || ''}
                          rows={2}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={t('adminCategoryForm.fields.descriptionTr.placeholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mr-2"
                disabled={isLoadingOnSubmit}
              >
                {t('adminCategoryForm.actions.cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-gold hover:bg-gold/90 text-white"
                disabled={isLoadingOnSubmit || !form.formState.isDirty}
              >
                {isLoadingOnSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('adminCategoryForm.actions.processing')}
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
}
