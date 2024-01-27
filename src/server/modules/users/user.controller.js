import userModel from './user.model.js';

const createUser = async (req, res) => {
  try {
    const { userName, email, password, phone } = req.body;
    const user = await userModel.create({ userName, email, password, phone });
    user.password = undefined;

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
  try {
    const users = await userModel.find({});
    users.forEach((user) => (user.password = undefined));

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
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: 'User get successfully',
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, phone, avatar } = req.body;

    const user = await userModel.findById(id);
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

    user.password = undefined;

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
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await userModel.findById(id);
    if (!user) {
      res.status(404).send({
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

export default { createUser, getUsers, getUserById, updateUser, changePassword, deleteUser };