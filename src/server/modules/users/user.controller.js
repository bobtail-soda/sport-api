import userModel from './user.model.js';
import bcrypt from 'bcrypt';

const createUser = async (req, res) => {
  // POST
  try {
    const { userName, email, password, phone } = req.body;

    // Hash password
    const saltRounds = 15;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create new user
    const user = await userModel.create({ userName, email, password: hashedPassword, phone });
    user.password = undefined;
    console.log('create user success');
    res.status(201).send({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const getUsers = async (req, res) => {
  // GET
  try {
    // const users = await userModel.find({});
    // users.forEach((user) =>  user.password = undefined)
    // const modifiedUsers = users.map(user => {
    //   const {_id, userName, email, phone, avatar} = user.toJSON();
    //   return { _id, userName, email, phone, avatar };
    // });

    const users = await userModel.find({}).select(' _id userName email phone avatar exercise_activities').lean();
    console.log(users);

    res.status(200).send({
      success: true,
      message: 'User get successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

const getUserById = async (req, res) => {
  //GET
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select(' _id userName email phone avatar date_of_birth gender height weight')
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: 'User get successfully',
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: 'Id not found',
      error: error,
    });
  }
};

const getUserByEmail = async (email) => {
  const user = await userModel
    .findOne({ email: email })
    .select(' _id userName password email phone avatar exercise_activities');
  return user;
};

const updateUser = async (req, res) => {
  // POST
  try {
    const { id } = req.params;
    const { userName, email, phone, avatar } = req.body;

    const user = await userModel.findById(id).select(' _id userName email phone avatar')
    if (!user) {
      res.status(404).send({
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
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

const changePassword = async (req, res) => {
  //PUT
  try {
    const { id } = req.params;
    const { password } = req.body;

    // hash password
    const saltRounds = 15;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await userModel.findById(id).select(' _id userName email phone avatar')
    if (!user) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (password) {
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).send({
      success: true,
      message: 'User changed password successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

const deleteUser = async (req, res) => {
  //DELETE
  try {
    const { id } = req.params;

    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).send({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error,
    });
  }
};

export default { createUser, getUsers, getUserById, getUserByEmail, updateUser, changePassword, deleteUser };
