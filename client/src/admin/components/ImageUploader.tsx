import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Loader2, X, Link } from 'lucide-react';
import { uploadToImgur } from '@/lib/imgurService';
import { useToast } from '@/hooks/use-toast';

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
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }

      // Limit file size to 5MB (Imgur's limit is 10MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
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
          title: 'Image uploaded',
          description: 'Your image has been uploaded successfully',
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Failed to upload image',
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
        title: 'Image URL added',
        description: 'The image URL has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid image URL',
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
              <Label htmlFor="image-upload">Upload from your device</Label>
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
              <Label htmlFor="image-url">Or enter image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" variant="secondary">
                  <Link className="h-4 w-4 mr-2" />
                  Add
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
                <Label>Preview</Label>
                <Button variant="destructive" size="sm" onClick={clearImage} className="h-8">
                  <X className="h-4 w-4 mr-2" />
                  Remove Image
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
