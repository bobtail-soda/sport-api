# sport-api

# create back-end starter with 5 easy step
### step 1: to initial project folder write this code on terminal 
`npx create-vite-express` 
### step 2: set up config
#### 2.1: set up at extensions.json with 
`{ "recommendations": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "mikestead.dotenv"}]`
#### 2.2: set up at setting.json with 
` { 
    "search.exclude": {
    "**/node_modules": true,
    ".next/": true,
    "package-lock.json": true,
    "yarn.lock": true
  },
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.trimTrailingWhitespace": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.format": "explicit",
    "source.organizeImports": "explicit",
    "source.sortMembers": "explicit",
    "source.formatDocument": "explicit",
    "source.addMissingImports": "explicit",
    "source.removeUnusedImports": "explicit"
  },
  "prettier.prettierPath": "./node_modules/prettier/index.cjs",
  "typescript.tsdk": "node_modules/typescript/lib"
} `

#### 2.3: `npm install -D prettier eslint eslint-config-next eslint-config-prettier` // for install devDependencise of configs
#### 2.4: set up prettier by create .prettierrc and write 
`{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "arrowParens": "always",
  "printWidth": 120,
  "tabWidth": 2,
  "endOfLine": "auto",
  "bracketSpacing": true,
  "embeddedLanguageFormatting": "auto",
  "overrides": []
}`
#### 2.5: set up .gitignore with 
``` 
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local
```
### step 3: set up ennvirontment by create config folder under server folder then create config.js  
#### 3.1 ` npm install mongoose dotenv cors`
#### 3.2 create .env file and write 
` PORT=5000 
  MONGODB_URI=mongodb+srv://bobtailsodadev:UYlIZEBV7X8REclY@bobtail-soda.zo76rwo.mongodb.net/ // link copy from atlas connect diver ` 
#### 3.3 create folder config and create config.js and write
` export const config = { 
    port: Number(process.env.PORT ?? 3000),
    mongodbUri: process.env.MONGODB_URI,  
}; `

### step 4: create database folder and create database.js for connect with mongoose for link data with our code 
#### write code in database.js with 
**** this one is for connect with database ****

``` import mongoose from 'mongoose';
  import { config } from '../config/config.js'
  
  async function mongooseConnetion() {
    try {
        // Connect to the MongoDB cluseter
        const mongoAtlasUri = config.mongodbUri;
        await mongoose.connect(mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'sport-db'});
        console.log('Mongoose is connected');
    } catch (error) {
        console.log('Mongoose error: '+ error.message);
    }

    const dbConnection = mongoose.connection;
    dbConnection.on('error', (err) => console.log(`Connection error ${err}`));
    dbConnection.once('open', () => console.log('Connection to DB! '));
  }
  
  export default mongooseConnection;
  ```
### step 5: create module folder
#### 5.1 create users folder and create each modules
#### 5.2 create user.model.js and create userSchema with this basic code and this Schema as 'User' variable this part will create at mongoDB collection name User and model of collection as we set

**** this one is for use function from database ****
``` import mongoose from 'mongoose'
  
  const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, 'user name is required'],
            unique: true,
        },
        email: {
            type: String,
            require: [true, 'email is required'],
        },
        phone: {
            type: String,
            required: [true, 'phone is required'],
        },
        avatar: {
            type: String,
            default: 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
        },
    },
    { timestamps: true }
  );

  export default mongoose.model('User', userSchema);
  ```
#### 5.3 create user controller by createa user.controller.js and write this code in ,and it about get, create, update, delete
``` import userModel from './user.model.js';

    const createUser = async (req, res) => {
        try {
          const { userName, email, password, phone } = req.body;
          const user = await userModel.create({ userName, email, password, phone});
          user.password = undefined;

          res.status(201).json({ 
            success: true,
            message: 'User created successfully',
            data: user,
          });
        }
    };

    const getUsers = async (req, res) => {
        try {
          const users = await userModel.find();
          user.forEach((user) => (user.password = undefined));

          res.status(200).json({ 
            success: true,
            message: 'User get successfully',
            data: user,
          });
        } catch (error) {
          console.log(error);
          res.status(500).jason({
            success: false,
            message: 'Internal server error',
            error: error,
          });
        }
    };

    const getUserById = async (req, res) => {
        try {
          const { id } req.params;
          const user = await userModel.findById(id);
          user.password = undefined;

          res.status(200).json({
            success: true,
            message: 'User get succsssfully',
            data: user,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
          });
        }
    };

    const updateUser = async (req, res) => {
        try {
          const { id } = req.params;
          const { userName, email, phone, avatar } = req.body;

          const user = await userModel.findById(id);
          if (!user) {
            res.status(404).json({
              success: false,
              message: 'User not found',
            });
            return;
          }

          if (userName) {
            user.userName = userName;
          }
          if (email) {
            user.email = email;
          }
          if (phone) {
            user.phone = phone;
          }
          if (avatar) {
            user.avater = avatar
          }

          await user.save();

          user.password = undefined;

          res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
          });
        }
    };

    const changePassword = async (req, res) => {
        try {
          const { id } = req.params;
          const { password } = req.body;

          const user = await userModel.findById(id);
          if (!user) {
            res.status(404).json({
              success: false,
              message: 'User not found',
            });
            return;
          }

          if (password) {
            user.password = password;
          }

          await user.save();

          res.status(200).send({
            succcess: true,
            message: 'User changed password successfully',
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error,
          });
        }
    };

    const deleteUser = async (req, res) => {
      try {
        const { id } = req.params;

        const user = await userModel.findByIdAndDelete(id);
        if (!user) {
          res.status(404).json({
            success: false,
            message: 'User not found',
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: 'User deleted successfully',
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error,
        });
      }
    };

    export default { createUser, getUsers, getUserById, updateUser, changePassword, deleteUser };
```
#### 5.4 create router by user.router.js 
` import express from 'express';
  import userController from './user.controller.js';

  const router = express.Router();
  router.post('/', userController.createrUser);
  router.get('/', userController.getUsers);
  router.get('/:id', userController.getUserById);

  router.put('/:id', userController.updateUser);
  router.patch('/:id/change-password', userController.changePassword);
  router.delete('/:id', userController.deleteUser);

  export default router;
`

#### step 5.5 set everything in main.js that already created at root 
``` import cors from 'cors';
  import 'dontenv/config';
  import express from 'express';
  import ViteExpress from 'vite-express';
  import { config } from './config/config.js';
  import mongo from './database/db.js';
  import userRouter from './modules/users/user.router.js';

  console.log({ config });

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api/users', userRouter);

  app.get('/hello', (req, res) => {
    res.send('Hello health Check!');
  });
  mongo();
  ViteExpress.listen(app, config.port, () => console.log(`Server is listening on port ${config.port}...`));
```

swagger package
day.js package
