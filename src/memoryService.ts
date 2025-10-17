import { supabase, Memory } from './supabaseClient';

export const saveMemory = async (
  userId: string,
  title: string,
  prompt: string,
  outputType: 'image' | 'video',
  outputDataUrl: string,
  editSettings: Memory['edit_settings']
): Promise<{ success: boolean; error?: string }> => {
  try {
    const memoryData = {
      user_id: userId,
      title,
      prompt,
      output_type: outputType,
      output_url: outputDataUrl,
      thumbnail_url: outputDataUrl,
      edit_settings: editSettings,
    };

    const { error } = await supabase.from('memories').insert([memoryData]);

    if (error) {
      console.error('Error saving memory:', error);
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
    const { error } = await supabase.from('memories').delete().eq('id', memoryId);

    if (error) {
      console.error('Error deleting memory:', error);
      return false;
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
