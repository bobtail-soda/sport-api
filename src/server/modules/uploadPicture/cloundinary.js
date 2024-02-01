import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import userModel from '../users/user.model.js';
import multer from 'multer';

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

export async function uploadToCloudinary(req, res, next) {
  const fileBufferBase64 = Buffer.from(req.file.buffer).toString('base64');
  const base64File = `data:${req.file.mimetype};base64,${fileBufferBase64}`;
  req.cloudinary = await cloudinary.uploader.upload(base64File, {
    resource_type: 'auto',
  });

  next();
}

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// upload photo function

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

// app.patch('/todos/:todoId/uploads', upload.single('image'), uploadToCloudinary, (req, res) => {
//   const todoId = parseInt(req.params.todoId, 10);
//   const updatedTodo = updateTodo(todoId, {
//     imagePath: req.cloudinary.secure_url,
//   });

//   if (!updatedTodo) {
//     res.status(404).json({ error: { message: 'todo not found' } });
//   }

//   res.json({ data: updatedTodo });
// });


