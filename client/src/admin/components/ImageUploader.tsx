import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { uploadToImgur } from '@/lib/imgurService';
import { Image as ImageIcon, Link, Loader2, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: Error) => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImageUrl = '',
  onImageUploaded,
  onError,
  label = 'Image',
}) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>('');
  const { toast } = useToast();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('adminImageUploader.invalidFileType'),
          description: t('adminImageUploader.invalidFileTypeDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Limit file size to 5MB (Imgur's limit is 10MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('adminImageUploader.fileTooLarge'),
          description: t('adminImageUploader.fileTooLargeDesc'),
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);

      try {
        // Upload to Imgur
        const url = await uploadToImgur(file);
        setImageUrl(url);
        onImageUploaded(url);
        toast({
          title: t('adminImageUploader.imageUploaded'),
          description: t('adminImageUploader.imageUploadedDesc'),
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: t('adminImageUploader.uploadError'),
          description: t('adminImageUploader.uploadErrorDesc'),
          variant: 'destructive',
        });
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUploaded, onError, toast]
  );

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    // Basic URL validation
    try {
      const url = new URL(manualUrl);
      if (!url.protocol.startsWith('http')) {
        throw new Error('URL must start with http:// or https://');
      }

      setImageUrl(manualUrl);
      onImageUploaded(manualUrl);
      setManualUrl('');
      toast({
        title: t('adminImageUploader.imageUrlAdded'),
        description: t('adminImageUploader.imageUrlAddedDesc'),
      });
    } catch {
      toast({
        title: t('adminImageUploader.invalidUrl'),
        description: t('adminImageUploader.invalidUrlDesc'),
        variant: 'destructive',
      });
    }
  };

  const clearImage = () => {
    setImageUrl('');
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">{label}</Label>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="image-upload">{t('adminImageUploader.uploadFromDevice')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="flex-1"
                />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-4">
            <form onSubmit={handleManualUrlSubmit} className="flex flex-col gap-2">
              <Label htmlFor="image-url">{t('adminImageUploader.enterImageUrl')}</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  type="text"
                  placeholder={t('adminImageUploader.imageUrlPlaceholder')}
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" variant="secondary">
                  <Link className="h-4 w-4 mr-2" />
                  {t('adminImageUploader.addUrl')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Image Preview */}
      {imageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>{t('adminImageUploader.currentImage')}</Label>
                <Button variant="destructive" size="sm" onClick={clearImage} className="h-8">
                  <X className="h-4 w-4 mr-2" />
                  {t('adminImageUploader.removeImage')}
                </Button>
              </div>
              <div className="relative aspect-video rounded-md overflow-hidden border bg-muted">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">{imageUrl}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
