import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase, Memory } from './supabaseClient';
import { useAuth } from './AuthContext';

interface MemoryGalleryProps {
  onClose: () => void;
  onLoadMemory?: (memory: Memory) => void;
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ onClose, onLoadMemory }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMemories();
  }, [user]);

  const loadMemories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error('Error loading memories:', err);
      setError('Failed to load your memories');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (memoryId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_favorite: !currentFavorite })
        .eq('id', memoryId);

      if (error) throw error;

      setMemories(prev =>
        prev.map(m => (m.id === memoryId ? { ...m, is_favorite: !currentFavorite } : m))
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      console.error('Error deleting memory:', err);
      alert('Failed to delete memory');
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gallery-modal" onClick={e => e.stopPropagation()}>
        <h2>Your Memories</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
          {memories.length} saved {memories.length === 1 ? 'memory' : 'memories'}
        </p>

        {loading && <p style={{ textAlign: 'center' }}>Loading your memories...</p>}
        {error && <p className="error" style={{ textAlign: 'center' }}>{error}</p>}

        {!loading && memories.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666' }}>
            You haven't saved any memories yet. Create your first one!
          </p>
        )}

        {!loading && memories.length > 0 && (
          <div className="gallery-grid">
            {memories.map(memory => (
              <div key={memory.id} className="gallery-item">
                <div className="gallery-item-preview">
                  {memory.output_type === 'video' ? (
                    <video src={memory.output_url} muted playsInline />
                  ) : (
                    <img src={memory.output_url} alt={memory.title} />
                  )}
                  <div className="gallery-item-overlay">
                    <button
                      onClick={() => toggleFavorite(memory.id, memory.is_favorite)}
                      className="icon-btn"
                      title={memory.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {memory.is_favorite ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      className="icon-btn delete-btn"
                      title="Delete memory"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="gallery-item-info">
                  <h4>{memory.title}</h4>
                  <p>{memory.prompt.substring(0, 80)}{memory.prompt.length > 80 ? '...' : ''}</p>
                  <small>{new Date(memory.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="modal-close-btn" style={{ float: 'none', display: 'block', margin: '1.5rem auto 0' }}>
          Close
        </button>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};
