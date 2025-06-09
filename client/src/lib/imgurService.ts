import { logger } from './api';

/**
 * Simple interface for Imgur API response
 */
interface ImgurUploadResponse {
  data: {
    link: string; // The only field we really need
  };
  success: boolean;
  status: number;
}

/**
 * Upload an image to Imgur using XMLHttpRequest
 * This approach avoids fetch-related HTTP/2 issues
 * @param file The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadToImgur(file: File): Promise<string> {
  logger.info(`Uploading image to Imgur: ${file.name} (${file.size} bytes)`);

  try {
    // Get credentials from environment variables
    const clientId = import.meta.env.VITE_IMGUR_CLIENT_ID;
    const accessToken = import.meta.env.VITE_IMGUR_ACCESS_TOKEN;

    if (!clientId) {
      throw new Error('Imgur client ID not found in environment variables');
    }

    // Create a form data object
    const formData = new FormData();
    formData.append('image', file);

    // Return a promise that resolves when the upload is complete
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set up upload completion handler
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.data?.link) {
              logger.info('Image uploaded successfully:', response.data.link);
              resolve(response.data.link);
            } else {
              reject(new Error('Imgur upload succeeded but no image link was returned'));
            }
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            reject(new Error(`Failed to parse Imgur response: ${errorMessage}`));
          }
        } else {
          let errorMsg = `HTTP error ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMsg += `: ${errorResponse.data?.error || 'Unknown error'}`;
          } catch (e) {
            errorMsg += `: ${xhr.statusText}`;
          }
          reject(new Error(errorMsg));
        }
      };

      // Set up error handler
      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading image'));
      };

      // Set up the request
      xhr.open('POST', 'https://api.imgur.com/3/image');

      // Set the headers
      xhr.setRequestHeader('Authorization', `Client-ID ${clientId}`);

      // Using only one authorization header at a time
      // Based on Imgur's API docs, Client-ID is preferred for anonymous uploads
      // If you need to use Bearer token, uncomment this line
      // xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

      // Send the request
      xhr.send(formData);
    });
  } catch (error) {
    logger.error('Error uploading to Imgur:', error);
    throw error;
  }
}

/**
 * Check if a URL is an Imgur image URL
 */
export function isImgurUrl(url: string): boolean {
  return url?.startsWith('https://i.imgur.com/');
}
