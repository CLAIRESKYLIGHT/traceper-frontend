import axios from "axios";

// ✅ Get API base URL from environment variable, fallback to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// ✅ Correct Laravel API base URL
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle response errors globally
API.interceptors.response.use(
  (response) => {
    // Return response as-is for successful requests
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_name");
        window.dispatchEvent(new Event("storage"));
        // Don't redirect here, let the App component handle it
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("API Request Error - No Response:", error.request);
    } else {
      // Something else happened
      console.error("API Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// ✅ Export helper functions
export const getProjects = () => API.get("/projects");

export default API;
