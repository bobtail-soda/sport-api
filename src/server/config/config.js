export const config = {
  port: Number(process.env.PORT ?? 3000),
  mongodbUri: process.env.MONGODB_URI,
  jwt_secret_key: process.env.JWT_SECRET_KEY,

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,

  swagger_url: process.env.SWAGGER_URL,
  gmail_passcode: process.env.GMAIL_PASSCODE,
};

// export default config;
