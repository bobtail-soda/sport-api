import activityTypeModel from './activityType.model.js';

const getActivityType = async (req, res) => {
  // #swagger.tags = ['Activity Type']
  // GET
  try {
    const activityTypes = await activityTypeModel.find({});
    activityTypes.forEach((activityType) => (activityType.id = undefined));

    res.status(200).send({
      success: true,
      message: 'get Activity Type successfully',
      data: activityTypes,
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


const createActivityType = async (req, res) => {
  // #swagger.tags = ['Activity Type']
  // POST
  try {
      const { name, met } = req.body;


    // create new user
    const activityType = await activityTypeModel.create({ name, met });
    res.status(201).send({
      success: true,
      message: 'User created successfully',
      data: activityType,
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

const updateActivityType = async (req, res) => {
  // #swagger.tags = ['Exercise Activity']
  try {
    const { id } = req.params;
    const { activity_type_id, caption, description, hour, minute, date, image } = req.body;

    const exerciseActivity = await exerciseActivityModel
      .findById(id)
      .select(' activity_type_id, caption, description, hour, minute, date, image');

    console.log('exerciseActivity: ', exerciseActivity);
    if (!exerciseActivity) {
      res.status(404).send({
        success: false,
        message: 'Exercise Activity not found',
      });
      return;
    }

    if (activity_type_id) {
      exerciseActivity.activity_type_id = activity_type_id;
    }
    if (caption) {
      exerciseActivity.caption = caption;
    }
    if (description) {
      exerciseActivity.description = description;
    }
    if (hour) {
      exerciseActivity.hour = hour;
    }
    if (minute) {
      exerciseActivity.minute = minute;
    }
    if (date) {
      exerciseActivity.date = date;
    }
    if (image) {
      exerciseActivity.image = image;
    }

    await exerciseActivity.save();

    res.status(200).send({
      success: true,
      message: 'Exercise Activity updated successfully',
      data: exerciseActivity,
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

const deleteActivityType = async (req, res) => {
  // #swagger.tags = ['Exercise Activity']
  //DELETE
  try {
    const { id } = req.params;
    //remove from exerciseActivity collection
    const exerciseActivity = await exerciseActivityModel.findByIdAndDelete(id);

    if (!exerciseActivity) {
      res.status(404).send({
        success: false,
        message: 'Exercise Activity not found',
      });
      return;
    }

    //remove from user collection
    const user_id = req.user.data._id; //get User Id from Token
    const user = await userModel.findById(user_id);
    if (!user) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }
    user.exercise_activities.pull(id);
    await user.save();

    res.status(200).send({
      success: true,
      message: 'Exercise Activity deleted successfully',
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

export default {
  getActivityType,
  createActivityType,
  updateActivityType,
  deleteActivityType,
};
