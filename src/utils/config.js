// Environment configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Storage URL for file downloads
// If VITE_STORAGE_URL is set, use it; otherwise construct from API_BASE_URL
export const getStorageUrl = (filePath) => {
  if (!filePath) return "";
  
  // If VITE_STORAGE_URL is explicitly set, use it
  if (import.meta.env.VITE_STORAGE_URL) {
    return `${import.meta.env.VITE_STORAGE_URL}/${filePath}`;
  }
  
  // Otherwise, construct from API_BASE_URL
  // Remove /api from the end if present
  const baseUrl = API_BASE_URL.replace(/\/api$/, "");
  return `${baseUrl}/storage/${filePath}`;
};

// Backend URL (without /api)
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

