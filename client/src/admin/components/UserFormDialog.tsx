import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, ImagePlus } from 'lucide-react';
import { UserData } from './UsersTable';

// Form validation schema
const userFormSchema = z
  .object({
    username: z
      .string()
      .min(3, {
        message: 'Username must be at least 3 characters.',
      })
      .email({
        message: 'Please enter a valid email address.',
      }),
    firstName: z.string().optional(),
    email: z
      .string()
      .email({
        message: 'Please enter a valid email address.',
      })
      .optional(),
    password: z
      .string()
      .min(6, {
        message: 'Password must be at least 6 characters.',
      })
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    isAdmin: z.boolean().default(false),
  })
  .refine(data => !data.password || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormData) => Promise<void>;
  user?: UserData;
  isLoading?: boolean;
}

export default function UserFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
}: UserFormDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(user?.imageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isNewUser = !user;

  // Set up form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      firstName: user?.firstName || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
      isAdmin: user?.isAdmin || false,
    },
  });

  // Handle form submission
  const handleSubmit = async (values: UserFormValues) => {
    // Create FormData to handle file upload
    const formData = new FormData();

    // Append user data
    formData.append('username', values.username);
    formData.append('firstName', values.firstName || '');
    formData.append('email', values.email || '');
    formData.append('isAdmin', values.isAdmin.toString());

    // Only include password if it's provided (for new users or password changes)
    if (values.password) {
      formData.append('password', values.password);
    }

    // Add user ID for updates
    if (user?.id) {
      formData.append('userId', user.id);
    }

    // Handle file upload if there's a file
    if (fileInputRef.current?.files?.[0]) {
      formData.append('profileImage', fileInputRef.current.files[0]);
    }

    // Submit the form
    await onSubmit(formData);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNewUser ? 'Add New User' : 'Edit User'}</DialogTitle>
          <DialogDescription>
            {isNewUser
              ? 'Create a new user account with the appropriate permissions.'
              : 'Update user details and permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative cursor-pointer group" onClick={handleImageClick}>
                <Avatar className="h-24 w-24 ring-2 ring-blue-300 ring-offset-2">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <ImagePlus className="h-8 w-8 text-white" />
                  </div>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Username (Email) */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address*</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="user@example.com" />
                  </FormControl>
                  <FormDescription>This will be used as the username for login.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isNewUser ? 'Password*' : 'New Password'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder={
                        isNewUser ? 'Enter password' : 'Leave blank to keep current password'
                      }
                    />
                  </FormControl>
                  {!isNewUser && (
                    <FormDescription>Leave blank to keep the current password.</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isNewUser ? 'Confirm Password*' : 'Confirm New Password'}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Confirm password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin Toggle */}
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Administrator Access</FormLabel>
                    <FormDescription>
                      Administrators can manage users and have full access to all features.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNewUser ? 'Creating...' : 'Saving...'}
                  </>
                ) : isNewUser ? (
                  'Create User'
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
