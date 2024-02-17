import userModel from '../users/user.model.js';
import exerciseActivityModel from './exerciseActivity.model.js';
// import auth from '../users/user.auth.js'; //TODO: uncomment when get code from branch 'hashPassword'
import mongoose from 'mongoose';
import activityTypeController from '../activityType/activityType.controller.js';

const getExerciseActivity = async (req, res) => {
  // #swagger.tags = ['Exercise Activity']
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
  // #swagger.tags = ['Exercise Activity']
  try {
    const { id } = req.params;

    const exerciseActivity = await exerciseActivityModel
      .findById(id)
      .select(' _id caption description hour minute distance calories date image activity_type_id');

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
  // #swagger.tags = ['Exercise Activity']
  // GET
  try {
    console.log('start: getExerciseActivityByUserId');
    //find user by id
    const { user_id } = req.params;
    const user = await userModel.findById(user_id);
    console.log('user', user);

    const exerciseActivities = user.exercise_activities;
    console.log('exerciseActivitiesArray: ', exerciseActivities);

    const docs = await exerciseActivityModel
      .find({
        _id: { $in: exerciseActivities },
      })
      .exec();

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
  // #swagger.tags = ['Exercise Activity']
  // POST
  try {
    const { activity_type_id, caption, description, hour, minute, distance, calories, date, image } = req.body;

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
    const newExerciseActivity = new exerciseActivityModel({
      activity_type_id: activity_type_id,
      caption: caption,
      description: description,
      hour: hour,
      minute: minute,
      distance: distance,
      calories: calories,
      date: date,
      image: image,
    });
    console.log('create new exercise activity success');

    const savedExerciseActivity = await newExerciseActivity.save();

    console.log('savedExerciseActivity: ', savedExerciseActivity);

    //Step3: update 'exercise_activity_id' to 'users'
    user.exercise_activities.push(savedExerciseActivity._id);
    await user.save();
    console.log('add exercise activity id to users success');

    res.status(201).send({
      success: true,
      message: 'Exercise activity created successfully',
      data: savedExerciseActivity,
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

const deleteExerciseActivity = async (req, res) => {
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

const getFavotiteActivityTypeByUserId = async (req, res) => {
  // #swagger.tags = ['Exercise Activity']
  // GET
  try {
    const { user_id } = req.params;
    const result = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user_id) }, // ใช้ user_id จาก request params
      },
      {
        $lookup: {
          from: 'exercise-activities',
          localField: 'exercise_activities._id',
          foreignField: '_id',
          as: 'activities',
        },
      },
      {
        $unwind: '$activities',
      },
      {
        $group: {
          _id: '$activities.activity_type_id',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 } // เรียงลำดับ count จากมากไปน้อย
      },
      {
        $limit: 3 // เลือกเฉพาะ 3 อันดับแรก
      },
      {
        $project: {
          _id: 0,
          activity_type_name: '$_id',
          count: 1,
        },
      },
    ]);

    // Create an array of promises for each item in the result array
    const promises = result.map(async (item) => {
      try {
        const activityTypeName = await activityTypeController.getActivityTypeNameById(item.activity_type_name);
        return {
          count: item.count,
          activity_type_name: activityTypeName.name
        };
      } catch (error) {
        console.error("Error getting activity type name:", error);
        return item; // Return the item unchanged in case of an error
      }
    });

    // Resolve all promises in parallel
    const updatedResult = await Promise.all(promises);

    res.status(200).send({
      success: true,
      message: 'get Favotite Activity Types By UserId successfully',
      data: updatedResult,
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

export default {
  getExerciseActivity,
  createExerciseActivity,
  getExerciseActivityById,
  getExerciseActivityByUserId,
  updateExerciseActivity,
  deleteExerciseActivity,
  getFavotiteActivityTypeByUserId
};
