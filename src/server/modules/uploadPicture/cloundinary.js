import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import userModel from '../users/user.model.js';
import multer from 'multer';

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

// upload to cloud middleware

export async function uploadToCloudinary(req, res, next) {
  const fileBufferBase64 = Buffer.from(req.file.buffer).toString('base64');
  const base64File = `data:${req.file.mimetype};base64,${fileBufferBase64}`;
  req.cloudinary = await cloudinary.uploader.upload(base64File, {
    resource_type: 'auto',
  });

  next();
}

const storage = multer.memoryStorage();
// upload middleware with cloudinary as storage by multer upload func
 const upload = multer({ storage });
 export const uploadSingle = upload.single('image');

// upload photo function to databases

export const updatePhotoByUserID = async (req, res) => {

  try {
    const { id } = req.params;
    console.log(req.params);
    const updatedPhoto = await userModel.findByIdAndUpdate(id, { avatar: req.cloudinary.secure_url });
    if (!updatedPhoto) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }
    res.json({ data: updatedPhoto})
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};




