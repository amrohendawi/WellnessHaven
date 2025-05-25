import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminAPI } from '@/lib/api';
import { Loader2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import UserFormDialog from './components/UserFormDialog';
import UsersTable, { UserData } from './components/UsersTable';

export default function UsersPage() {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | undefined>(undefined);
  const { t } = useTranslation();

  // Fetch users data
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAPI<UserData[]>('users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(t('adminUsers.failedToLoadUsers'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle opening the form dialog for creating a new user
  const handleAddUser = () => {
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  // Handle opening the form dialog for editing an existing user
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  // Handle user form submission (create or update)
  const handleSubmitUser = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const endpoint = selectedUser ? 'users/update' : 'users/create';

      const response = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save user');
      }

      toast.success(
        selectedUser ? t('adminUsers.userUpdatedSuccess') : t('adminUsers.userCreatedSuccess')
      );
      setDialogOpen(false);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error instanceof Error ? error.message : t('adminUsers.failedToSaveUser'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      toast.success(t('adminUsers.userDeletedSuccess'));
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : t('adminUsers.failedToDeleteUser'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('adminUsers.title')}</h2>
          <p className="text-gray-600 mt-1">{t('adminUsers.subtitle')}</p>
        </div>
        <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          {t('adminUsers.addUser')}
        </Button>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t('adminUsers.usersTableTitle')}</CardTitle>
          <CardDescription>{t('adminUsers.usersTableDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <UsersTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
              currentUserId={undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog for Creating/Editing */}
      <UserFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitUser}
        user={selectedUser}
        isLoading={isSubmitting}
      />
    </div>
  );
}
