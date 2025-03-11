//image processing utility functions
const cloudinary = require('../configuration/cloudinary');

//process image from buffer to data URI
const bufferToDataURI = (mimetype, buffer) => {
  const b64 = Buffer.from(buffer).toString("base64");
  return `data:${mimetype};base64,${b64}`;
};

//upload image to cloudinary
const uploadToCloudinary = async (dataURI, imageName) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      dataURI,
      {
        public_id: imageName,
      }
    );
    
    return uploadResult;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  bufferToDataURI,
  uploadToCloudinary
};