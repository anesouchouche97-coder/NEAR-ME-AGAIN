import { supabase, Memory } from './supabaseClient';
import { uploadFile, dataUrlToBlob, generateThumbnail, deleteFile, getStoragePathFromUrl } from './storageService';

export const saveMemory = async (
  userId: string,
  title: string,
  prompt: string,
  outputType: 'image' | 'video',
  outputDataUrl: string,
  editSettings: Memory['edit_settings']
): Promise<{ success: boolean; error?: string }> => {
  try {
    const timestamp = Date.now();
    const fileName = `memory-${timestamp}.${outputType === 'video' ? 'mp4' : 'jpg'}`;

    const blob = await dataUrlToBlob(outputDataUrl);
    const { url: memoryUrl, error: uploadError } = await uploadFile(
      'memories',
      userId,
      blob,
      fileName
    );

    if (uploadError || !memoryUrl) {
      return { success: false, error: uploadError || 'Failed to upload memory' };
    }

    let thumbnailUrl = memoryUrl;
    if (outputType === 'video') {
      try {
        const thumbnailDataUrl = await generateThumbnail(outputDataUrl);
        const thumbnailBlob = await dataUrlToBlob(thumbnailDataUrl);
        const thumbnailFileName = `thumb-${timestamp}.jpg`;
        const { url: thumbUrl } = await uploadFile('thumbnails', userId, thumbnailBlob, thumbnailFileName);
        if (thumbUrl) {
          thumbnailUrl = thumbUrl;
        }
      } catch (err) {
        console.warn('Failed to generate thumbnail, using memory URL:', err);
      }
    }

    const memoryData = {
      user_id: userId,
      title,
      prompt,
      output_type: outputType,
      output_url: memoryUrl,
      thumbnail_url: thumbnailUrl,
      edit_settings: editSettings,
    };

    const { error } = await supabase.from('memories').insert([memoryData]);

    if (error) {
      console.error('Error saving memory to database:', error);
      await deleteFile('memories', `${userId}/${fileName}`);
      if (thumbnailUrl !== memoryUrl) {
        await deleteFile('thumbnails', `${userId}/thumb-${timestamp}.jpg`);
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error saving memory:', err);
    return { success: false, error: 'Failed to save memory' };
  }
};

export const getUserMemories = async (userId: string): Promise<Memory[]> => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching memories:', err);
    return [];
  }
};

export const deleteMemory = async (memoryId: string): Promise<boolean> => {
  try {
    const { data: memory } = await supabase
      .from('memories')
      .select('output_url, thumbnail_url')
      .eq('id', memoryId)
      .single();

    const { error } = await supabase.from('memories').delete().eq('id', memoryId);

    if (error) {
      console.error('Error deleting memory:', error);
      return false;
    }

    if (memory) {
      const memoryPath = getStoragePathFromUrl(memory.output_url);
      if (memoryPath) {
        await deleteFile('memories', memoryPath);
      }

      if (memory.thumbnail_url && memory.thumbnail_url !== memory.output_url) {
        const thumbPath = getStoragePathFromUrl(memory.thumbnail_url);
        if (thumbPath) {
          await deleteFile('thumbnails', thumbPath);
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting memory:', err);
    return false;
  }
};

export const updateMemory = async (
  memoryId: string,
  updates: Partial<Memory>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', memoryId);

    if (error) {
      console.error('Error updating memory:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error updating memory:', err);
    return false;
  }
};
