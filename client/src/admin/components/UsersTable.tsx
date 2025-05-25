import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface UserData {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  imageUrl?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

export default function UsersTable({
  users,
  onEdit,
  onDelete,
  isLoading = false,
  currentUserId,
}: UsersTableProps) {
  const { t } = useTranslation();
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  // Function to get user's initials for the avatar fallback
  const getInitials = (user: UserData) => {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">{t('adminUsersTable.tableHeaders.avatar')}</TableHead>
            <TableHead>{t('adminUsersTable.tableHeaders.username')}</TableHead>
            <TableHead>{t('adminUsersTable.tableHeaders.email')}</TableHead>
            <TableHead>{t('adminUsersTable.tableHeaders.name')}</TableHead>
            <TableHead>{t('adminUsersTable.tableHeaders.role')}</TableHead>
            <TableHead>{t('adminUsersTable.tableHeaders.created')}</TableHead>
            <TableHead className="text-right">
              {t('adminUsersTable.tableHeaders.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                {t('adminUsersTable.loadingUsers')}
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                {t('adminUsersTable.noUsersFound')}
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    {user.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={user.username} />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(user)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {user.username}
                  {user.id === currentUserId && (
                    <Badge variant="outline" className="ml-2">
                      {t('adminUsersTable.you')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{user.firstName || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.isAdmin ? 'default' : 'secondary'}
                    className={user.isAdmin ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'}
                  >
                    {user.isAdmin ? t('adminUsersTable.admin') : t('adminUsersTable.staff')}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title={t('adminUsersTable.editUser')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* Don't allow deleting your own account */}
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title={t('adminUsersTable.deleteUser')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => !userToDelete && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminUsersTable.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminUsersTable.deleteConfirmDescription', { username: userToDelete?.username })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              {t('adminUsersTable.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {t('adminUsersTable.deleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
