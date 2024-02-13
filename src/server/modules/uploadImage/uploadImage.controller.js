import { v2 as cloudinary } from 'cloudinary';

const uploadImage = async (req, res) => {
  // #swagger.tags = ['Upload Image']
  try {
    const fileBufferBase64 = Buffer.from(req.file.buffer).toString('base64');
    const base64File = `data:${req.file.mimetype};base64,${fileBufferBase64}`;

    req.cloudinary = await cloudinary.uploader
      .upload(base64File,{
          resource_type: 'image',
      },
      )
      .then((result) =>
        res.status(200).send({
          success: true,
          message: 'Upload image to Cloudinary successfully.',
          data: result,
        })
      );
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: error,
    }),
      res.status(500).send({
        success: false,
        message: 'Internal server error',
        error,
      });
  }
};

export default { uploadImage };
