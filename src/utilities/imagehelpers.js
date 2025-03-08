import { clean as profanityClean } from 'profanity-cleaner';

//convert file to base64 for preview
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}
  
//create form data for image upload
export function createImageFormData(image, userId, additionalData = {}) {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("userId", userId);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
    
    return formData;
}
  
//get appropriate icon for file type
export function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
      return 'bi-file-image';
    } else if (fileType.startsWith('video/')) {
      return 'bi-file-play';
    } else if (fileType.startsWith('audio/')) {
      return 'bi-file-music';
    } else {
      return 'bi-file-earmark';
    }
}

//clean text content with profanity filter
export async function cleanTextContent(text, options = { keepFirstAndLastChar: true, placeholder: '#' }) {
    if (!text) return '';
    return await profanityClean(text, options);
}