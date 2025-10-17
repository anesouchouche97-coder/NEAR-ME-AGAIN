import { supabase } from './supabaseClient';

export const uploadFile = async (
  bucket: 'user-photos' | 'memories' | 'thumbnails',
  userId: string,
  file: Blob,
  fileName: string
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return { url: null, error: 'Failed to upload file' };
  }
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

export const generateThumbnail = async (
  videoUrl: string,
  timeInSeconds: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = timeInSeconds;

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataUrl);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video for thumbnail'));
    };
  });
};

export const deleteFile = async (
  bucket: 'user-photos' | 'memories' | 'thumbnails',
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return false;
  }
};

export const getStoragePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const objectIndex = pathParts.findIndex(part => part === 'object');

    if (objectIndex === -1) return null;

    const bucketIndex = objectIndex + 2;
    return pathParts.slice(bucketIndex).join('/');
  } catch (err) {
    console.error('Error parsing storage URL:', err);
    return null;
  }
};
