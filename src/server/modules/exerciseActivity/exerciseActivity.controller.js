import userModel from '../users/user.model.js';
import exerciseActivityModel from './exerciseActivity.model.js';
// import auth from '../users/user.auth.js'; TODO: uncomment when get code from branch 'hashPassword'

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

const createExerciseActivity = async (req, res) => {
  // POST
  try {
    const { activity_type_id, caption, description, hour, minute, date, image } = req.body;

    //Step1: get user from token
    // const user_id = auth.req.user._id  TODO: uncomment when get code from branch 'hashPassword'
    const user_id = '65b681af0b05bc9144534cab'; // TODO: fixed for waiting code from branch 'hashPassword'
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

export default { getExerciseActivity, createExerciseActivity };
