import { useState, useEffect } from "react";
import { getUserId } from "../api/authApi";

const STORAGE_KEY = "tts_queue";

/**
 * Hook để quản lý hàng đợi chuyển đổi audio
 * Lưu vào localStorage và tự động xóa khi logout
 */
export function useTTSQueue() {
  const userId = getUserId();
  const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;

  // Load queue from localStorage on mount
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading TTS queue from localStorage:", error);
    }
    return [];
  });

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      if (queue.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(queue));
      } else {
        // Remove from localStorage if queue is empty
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Error saving TTS queue to localStorage:", error);
    }
  }, [queue, storageKey]);

  const addToQueue = (item) => {
    setQueue((prev) => {
      // Normalize chapterId to number for consistency
      const normalizedId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
      const normalizedItem = { ...item, id: normalizedId };
      
      // Check if item already exists (compare as numbers)
      const exists = prev.some((q) => {
        const qId = typeof q.id === 'string' ? parseInt(q.id, 10) : q.id;
        return qId === normalizedId;
      });
      
      if (exists) {
        console.log("⚠️ Queue item already exists, updating instead:", normalizedId);
        // Update existing item instead of adding duplicate
        return prev.map((q) => {
          const qId = typeof q.id === 'string' ? parseInt(q.id, 10) : q.id;
          return qId === normalizedId ? { ...q, ...normalizedItem } : q;
        });
      }
      
      console.log("➕ Adding new queue item:", normalizedItem);
      return [...prev, normalizedItem];
    });
  };

  const updateQueueItem = (chapterId, updates) => {
    // Normalize chapterId to number for consistency
    const normalizedId = typeof chapterId === 'string' ? parseInt(chapterId, 10) : chapterId;
    
    console.log("🔄 updateQueueItem called:", { chapterId, normalizedId, updates, currentQueueLength: queue.length });
    
    setQueue((prev) => {
      // Find item with normalized ID comparison
      const found = prev.find((item) => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
        return itemId === normalizedId;
      });
      
      if (!found) {
        console.warn("⚠️ Queue item not found for chapterId:", normalizedId, "Available IDs:", prev.map(i => {
          const id = typeof i.id === 'string' ? parseInt(i.id, 10) : i.id;
          return id;
        }));
        return prev;
      }
      
      const updated = prev.map((item) => {
        const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
        if (itemId === normalizedId) {
          const updatedItem = { ...item, ...updates };
          console.log("✅ Updating queue item:", { from: item, to: updatedItem });
          return updatedItem;
        }
        return item;
      });
      
      return updated;
    });
  };

  const removeFromQueue = (chapterId) => {
    setQueue((prev) => prev.filter((item) => item.id !== chapterId));
  };

  const clearQueue = () => {
    setQueue([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  // Clear queue when userId changes (logout)
  useEffect(() => {
    if (!userId) {
      clearQueue();
    }
  }, [userId]);

  return {
    queue,
    addToQueue,
    updateQueueItem,
    removeFromQueue,
    clearQueue,
    setQueue,
  };
}

/**
 * Utility function to clear all TTS queues (called on logout)
 */
export function clearAllTTSQueues() {
  try {
    // Clear all TTS queue entries from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing TTS queues:", error);
  }
}

