import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config.js'
import userModel from '../modules/users/user.model.js';
import multer from 'multer';
import AppError from './appError.js';

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

// upload to cloud middleware

export async function uploadToCloudinary(req, res, next) {
  // #swagger.tags = ['Upload Image']
  const fileBufferBase64 = Buffer.from(req.file.buffer).toString('base64');
  const base64File = `data:${req.file.mimetype};base64,${fileBufferBase64}`;
  req.cloudinary = await cloudinary.uploader.upload(base64File, {
    resource_type: 'image',
  });

  next();
}

// multer config
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// upload middleware with cloudinary as storage by multer upload func

 export const uploadSingle = upload.single('image');

// upload photo function to databases

export const updatePhotoByUserID = async (req, res) => {
  // #swagger.tags = ['User']

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



