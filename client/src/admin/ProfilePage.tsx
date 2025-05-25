import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminAPI } from '@/lib/api';
import { ImagePlus, Loader2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ProfileData {
  username: string;
  firstName?: string;
  email?: string;
  imageUrl?: string;
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const data = await fetchAdminAPI<ProfileData>('profile');
        setProfile(data);
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(t('adminProfile.failedToLoadProfile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(t('adminProfile.passwordsDoNotMatch'));
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      if (profile) {
        formData.append('username', profile.username);
        formData.append('firstName', profile.firstName || '');
        formData.append('email', profile.email || '');
      }

      if (newPassword) {
        formData.append('password', newPassword);
      }

      if (fileInputRef.current?.files?.[0]) {
        formData.append('profileImage', fileInputRef.current.files[0]);
      }

      const response = await fetch('/api/admin/profile/update', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      // Visual feedback that something is happening
      toast.loading(t('adminProfile.updating'), { id: 'profile-update' });

      if (response.ok) {
        // Dismiss the loading toast and show success
        toast.dismiss('profile-update');
        toast.success(t('adminProfile.profileUpdatedSuccess'), {
          duration: 3000,
          position: 'top-center',
        });

        setNewPassword('');
        setConfirmPassword('');

        // Refresh profile data
        const updatedProfile = await fetchAdminAPI<ProfileData>('profile');
        setProfile(updatedProfile);
        if (updatedProfile.imageUrl) {
          setImagePreview(updatedProfile.imageUrl);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || t('adminProfile.failedToUpdateProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // Dismiss the loading toast and show error
      toast.dismiss('profile-update');
      toast.error(error instanceof Error ? error.message : t('adminProfile.failedToUpdateProfile'), {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
        <span className="ml-2">{t('adminProfile.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('adminProfile.title')}</h2>
        <p className="text-gray-600 mt-1">{t('adminProfile.basicInfoDescription')}</p>
      </div>

      <Separator />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('adminProfile.basicInfo')}</CardTitle>
            <CardDescription>{t('adminProfile.basicInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
                <div className="relative cursor-pointer group" onClick={handleImageClick}>
                  <Avatar className="h-24 w-24 ring-2 ring-gold/30 ring-offset-2 ring-offset-white">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt="Profile picture" />
                    ) : (
                      <AvatarFallback className="bg-gold/20 text-gold-dark">
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <ImagePlus className="h-8 w-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t('adminProfile.profilePicture')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('adminProfile.profilePictureDescription')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('adminProfile.username')}</Label>
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    onChange={e =>
                      setProfile(prev => (prev ? { ...prev, username: e.target.value } : null))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('adminProfile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={profile?.firstName || ''}
                    onChange={e =>
                      setProfile(prev => (prev ? { ...prev, firstName: e.target.value } : null))
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('adminProfile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    onChange={e =>
                      setProfile(prev => (prev ? { ...prev, email: e.target.value } : null))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('adminProfile.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full"
                    placeholder={t('adminProfile.newPassword')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('adminProfile.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full"
                    placeholder={t('adminProfile.confirmPassword')}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-pink-dark hover:bg-pink-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('adminProfile.updating')}
                  </>
                ) : (
                  t('adminProfile.updateProfile')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminProfile.accountSettings')}</CardTitle>
            <CardDescription>{t('adminProfile.accountSettingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{t('adminProfile.accountType')}</h3>
                <p className="text-gray-500">{t('adminProfile.administrator')}</p>
              </div>

              <div>
                <h3 className="font-semibold">{t('adminProfile.accountStatus')}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600">{t('adminProfile.active')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
