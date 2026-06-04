import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clean API handler wrappers for VaultDrop endpoints
export const fileService = {
  /**
   * Request a pre-signed S3 upload URL and record creation
   * @param {Object} payload - { originalName, password, expiresInMinutes }
   */
  requestUploadUrl: async (payload) => {
    const response = await API.post('/files/upload', payload);
    return response.data;
  },

  /**
   * Submit password verification to burn the record and fetch the S3 download link
   * @param {string} id - Document ID
   * @param {string} password - Security key
   */
  verifyAndPasswordDownload: async (id, password) => {
    const response = await API.post(`/files/download/${id}`, { password });
    return response.data;
  },
  
  /**
   * Stream the file direct-to-cloud to AWS S3 bypass backend memory completely
   * @param {string} presignedUrl - S3 Target link
   * @param {File} fileBlob - Actual browser file object
   */
  uploadDirectToS3: async (presignedUrl, fileBlob) => {
    return await axios.put(presignedUrl, fileBlob, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  },
};

export default API;