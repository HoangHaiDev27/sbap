import { API_ENDPOINTS } from '../config/apiConfig';
import { authFetch } from './authApi';

const API_URL = `${API_ENDPOINTS.API_BASE_URL}/api/readingschedule`;

// Get reading schedules by user ID
export const getReadingSchedulesByUserId = async (userId) => {
  try {
    const response = await authFetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch reading schedules');
    return response.json();
  } catch (error) {
    console.error('Error fetching reading schedules:', error);
    throw error;
  }
};

// Get reading schedules by date
export const getReadingSchedulesByDate = async (userId, date) => {
  try {
    const response = await authFetch(`${API_URL}/user/${userId}/date/${date}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch reading schedules by date');
    return response.json();
  } catch (error) {
    console.error('Error fetching reading schedules by date:', error);
    throw error;
  }
};

// Get reading schedule by ID
export const getReadingScheduleById = async (scheduleId) => {
  try {
    const response = await authFetch(`${API_URL}/${scheduleId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch reading schedule');
    return response.json();
  } catch (error) {
    console.error('Error fetching reading schedule:', error);
    throw error;
  }
};

// Create new reading schedule
export const createReadingSchedule = async (scheduleData) => {
  try {
    const response = await authFetch(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
    if (!response.ok) throw new Error('Failed to create reading schedule');
    return response.json();
  } catch (error) {
    console.error('Error creating reading schedule:', error);
    throw error;
  }
};

// Update reading schedule
export const updateReadingSchedule = async (scheduleId, updateData) => {
  try {
    const response = await authFetch(`${API_URL}/${scheduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Failed to update reading schedule');
    return response.json();
  } catch (error) {
    console.error('Error updating reading schedule:', error);
    throw error;
  }
};

// Delete reading schedule
export const deleteReadingSchedule = async (scheduleId) => {
  try {
    const response = await authFetch(`${API_URL}/${scheduleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Reading schedule not found');
      }
      throw new Error('Failed to delete reading schedule');
    }
    // No need to parse JSON for 204 NoContent response
    return { success: true };
  } catch (error) {
    console.error('Error deleting reading schedule:', error);
    throw error;
  }
};

// Mark schedule as completed
export const markScheduleCompleted = async (scheduleId) => {
  try {
    const response = await authFetch(`${API_URL}/${scheduleId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to mark schedule as completed');
    return response.json();
  } catch (error) {
    console.error('Error marking schedule as completed:', error);
    throw error;
  }
};

// Get reading schedule stats
export const getReadingScheduleStats = async (userId) => {
  try {
    const response = await authFetch(`${API_URL}/user/${userId}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch reading schedule stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching reading schedule stats:', error);
    throw error;
  }
};
