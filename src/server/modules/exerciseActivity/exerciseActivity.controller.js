import userModel from '../users/user.model.js';
import exerciseActivityModel from './exerciseActivity.model.js';
import { ObjectId } from 'mongoose';
import userController from '../users/user.controller.js';
// import auth from '../users/user.auth.js'; //TODO: uncomment when get code from branch 'hashPassword'

const getExerciseActivity = async (req, res) => {
  // GET
  try {
    const exerciseActivities = await exerciseActivityModel.find({});
    exerciseActivities.forEach((exerciseActivity) => (exerciseActivity.id = undefined));

    res.status(200).send({
      success: true,
      message: 'Exercise Activity get successfully',
      data: exerciseActivities,
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

const getExerciseActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const exerciseActivity = await exerciseActivityModel.findById(id).select(' _id caption description hour minute date image activity_type_id');

    res.status(200).send({
      success: true,
      message: `Exercise Activity by ${id} get successfully`,
      data: exerciseActivity,
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


const getExerciseActivityByUserId = async (req, res) => {
  // GET
  try {
    //find user by id
    const user_id = req.params.user_id;
    const user = await userModel.findById(user_id);
     console.log("user", user);

    const exerciseActivities = user.exercise_activities;
    console.log('exerciseActivitiesArray: ', exerciseActivities);

    const docs = await exerciseActivityModel.find({
      _id: { $in: exerciseActivities },
    }).exec();

    console.log("docs: ", docs);

    // const xxx = exerciseActivities.toString();
    // console.log('xxx:', xxx.exercise_activities);

    // const exerciseActivityIds = exerciseActivities.map((exerciseActivity) => exerciseActivity._id);
    // console.log("exerciseActivityIds: ", exerciseActivityIds);

    // // exerciseActivities.forEach((exerciseActivity) => (exerciseActivity._id = undefined));
    // const result = `${exerciseActivityIds}`;
    // // console.log('exerciseActivity after loop result: ', exerciseActivityIds.toString());
    // console.log('exerciseActivity after loop result: ', result);

    // const exerciseActivityResult = await exerciseActivityModel.findById(result);



    res.status(200).send({
      success: true,
      message: `Exercise Activity by ${user_id} get successfully`,
      data: docs, //exerciseActivityResult
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

const createExerciseActivity = async (req, res) => {
  // POST
  try {
    const { activity_type_id, caption, description, hour, minute, date, image } = req.body;

    //Step1: get user from token
    /**
     * req.user.data from user.auth.js
     * get user from token
     */
    const user_id = req.user.data._id;

    const user = await userModel.findById(user_id);
    if (!user) {
      res.status(404).send({
        success: false,
        message: 'User not found',
      });
      return;
    }

    //Step2:  create new exercise activity
    const exerciseActivity = await exerciseActivityModel.create({
      activity_type_id,
      caption,
      description,
      hour,
      minute,
      date,
      image,
    });
    console.log('create exercise activity success');

    //Step3: update 'exercise_activity_id' to 'users'
    const exercise_activity_id = exerciseActivity._id;
    if (exercise_activity_id) {
      user.exercise_activities.push(exercise_activity_id);
      user.save();
      console.log('add exercise activity id to users success');
    }
    res.status(201).send({
      success: true,
      message: 'Exercise activity created successfully',
      data: exerciseActivity,
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

const updateExerciseActivity = async (req, res) => {
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

const deleteExerciseActivity = async (req, res) => {
  //DELETE
  try {
    const { id } = req.params;

    const exerciseActivity = await exerciseActivityModel.findByIdAndDelete(id);
    if (!exerciseActivity) {
      res.status(404).send({
        success: false,
        message: 'Exercise Activity not found',
      });
      return;
    }

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
  getExerciseActivity,
  createExerciseActivity,
  getExerciseActivityById,
  getExerciseActivityByUserId,
  updateExerciseActivity,
  deleteExerciseActivity,
};
