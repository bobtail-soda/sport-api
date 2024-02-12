import mongoose from 'mongoose';
import userModel from '../users/user.model.js';

const getsummaryCardByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user_id) }, // Use the user_id from request params
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
          _id: '$_id',
          totalHours: { $sum: '$activities.hour' },
          totalMinutes: { $sum: '$activities.minute' },
          totalDistance: { $sum: '$activities.distance' },
          totalCalories: { $sum: '$activities.calories' },
        },
      },
      {
        $project: {
          _id: 0,
          user_id: '$_id',
          totalHours: 1,
          totalMinutes: 1,
          totalDistance: 1,
          totalCalories: 1,
        },
      },
    ]);

    // Calculate total hours and minutes
    let totalHours = 0;
    let totalMinutes = 0;
    let totalDistance = 0;
    let totalCalories = 0;

    result.forEach((item) => {
      totalHours += item.totalHours;
      totalMinutes += item.totalMinutes;
      totalDistance += item.totalDistance;
      totalCalories += item.totalCalories;
    });
    // Convert excess minutes to hours
    const sumData = {
      totalHours: totalHours += Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes %= 60,
      totalDistance: result[0].totalDistance,
      totalCalories: result[0].totalCalories,
    };

    res.status(200).json({
      success: true,
      message: 'Summary retrieved successfully',
      data: sumData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getActivitiesTypeByUserId = async (req, res) => {
  // #swagger.tags = ['Dashboard']
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
        $project: {
          _id: 0,
          activity_type_name: '$_id',
          count: 1,
        },
      },
    ]);

    //mock data result
    const data = {
      date_range: 'Weekly',
      chart_datas: result
    };

    res.status(200).send({
      success: true,
      message: 'get Activitie By UserId successfully',
      data: data,
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

const getGraphSummaryDataByUserId = async (req, res) => {
  // #swagger.tags = ['Dashboard']
  // GET
  try {
    //code here

    //mock data result
    const data = {
      date_range: 'Weekly',
      series: [
        {
          name: 'Calories',
          data: [130, 80, 50, 90, 100, 60, 70],
        },
        {
          name: 'Duration',
          data: [60, 55, 20, 61, 56, 30, 50],
        },
        {
          name: 'Distance',
          data: [5, 4.5, 2.5, 4.8, 4.9, 3, 3.5],
        },
        // {
        //   name: 'Calories',
        //   data: [
        //     {
        //       x: 'Sun',
        //       y: 130,
        //     },
        //     {
        //       x: 'Mon',
        //       y: 80,
        //     },
        //     {
        //       x: 'Tue',
        //       y: 50,
        //     },
        //     {
        //       x: 'Wed',
        //       y: 90,
        //     },
        //     {
        //       x: 'Thu',
        //       y: 100,
        //     },
        //     {
        //       x: 'Fri',
        //       y: 60,
        //     },
        //     {
        //       x: 'Sat',
        //       y: 70,
        //     },
        //     {
        //       x: 'Sun',
        //       y: 51,
        //     },
        //   ],
        // },
        // {
        //   name: 'Duration',
        //   data: [
        //     {
        //       x: 'Sun',
        //       y: 60,
        //     },
        //     {
        //       x: 'Mon',
        //       y: 55,
        //     },
        //     {
        //       x: 'Tue',
        //       y: 20,
        //     },
        //     {
        //       x: 'Wed',
        //       y: 61,
        //     },
        //     {
        //       x: 'Thu',
        //       y: 56,
        //     },
        //     {
        //       x: 'Fri',
        //       y: 30,
        //     },
        //     {
        //       x: 'Sat',
        //       y: 50,
        //     },
        //     {
        //       x: 'Sun',
        //       y: 35,
        //     },
        //   ],
        // },
        // {
        //   name: 'Distance',
        //   data: [
        //     {
        //       x: 'Sun',
        //       y: 5,
        //     },
        //     {
        //       x: 'Mon',
        //       y: 4.5,
        //     },
        //     {
        //       x: 'Tue',
        //       y: 2.5,
        //     },
        //     {
        //       x: 'Wed',
        //       y: 4.8,
        //     },
        //     {
        //       x: 'Thu',
        //       y: 4.9,
        //     },
        //     {
        //       x: 'Fri',
        //       y: 3,
        //     },
        //     {
        //       x: 'Sat',
        //       y: 3.5,
        //     },
        //     {
        //       x: 'Sun',
        //       y: 2,
        //     },
        //   ],
        // },
      ],
    };

    res.status(200).send({
      success: true,
      message: 'get Health History By UserId successfully',
      data: data,
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
  getsummaryCardByUserId,
  getActivitiesTypeByUserId,
  getGraphSummaryDataByUserId,
};
