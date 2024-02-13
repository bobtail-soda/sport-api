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
      totalHours: (totalHours += Math.floor(totalMinutes / 60)),
      totalMinutes: (totalMinutes %= 60),
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
      chart_datas: result,
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

//มี data
const getGraphSummaryDataByUserId = async (req, res) => {
  // #swagger.tags = ['Dashboard']
  // GET
  try {
    const { user_id } = req.params;

    const result = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user_id) },
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
          totalCalories: { $sum: '$activities.calories' },
          totalDuration: { $sum: { $add: [{ $multiply: ['$activities.hour', 60] }, '$activities.minute'] } },
          totalDistance: { $sum: '$activities.distance' }
        },
      },
      {
        $project: {
          _id: 0,
          activity_type_name: '$_id',
          calories: '$totalCalories',
          duration: { $divide: ['$totalDuration', 60] }, // Convert total duration to hours
          distance: '$totalDistance'
        },
      },
    ]);

    // Organize data for response
    const series = [
      { name: 'Calories', data: result.map(activity => activity.calories || 0) },
      { name: 'Duration', data: result.map(activity => activity.duration || 0) },
      { name: 'Distance', data: result.map(activity => activity.distance || 0) }
    ];

    const data = {
      date_range: 'Weekly',
      series: series
    };

    res.status(200).send({
      success: true,
      message: `Weekly Exercise Activity by ${user_id} get successfully`,
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

//TODO: Send date_range to api but have no data
// const getGraphSummaryDataByUserId = async (req, res) => {
//   // #swagger.tags = ['Dashboard']
//   // GET
//   try {
//     const { user_id } = req.params;
//     const { date_range } = req.query;

//     const matchQuery = { _id: new mongoose.Types.ObjectId(user_id) };

//     // Determine the date range based on the query parameter
//     if (date_range === 'today') {
//       matchQuery['activities.createdAt'] = {
//         $gte: new Date(new Date().setHours(0, 0, 0)),
//         $lt: new Date(new Date().setHours(23, 59, 59)),
//       };
//     } else if (date_range === 'weekly') {
//       // Calculate start and end of the week
//       const currentDate = new Date(); //Mon
//       console.log('currentDate: ', currentDate);
//       const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // -Mon
//       console.log('startOfWeek: ', startOfWeek);
//       const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
//       console.log('endOfWeek: ', endOfWeek);
//       matchQuery['activities.createdAt'] = {
//         $gte: new Date(startOfWeek.setHours(0, 0, 0)),
//         $lt: new Date(endOfWeek.setHours(23, 59, 59)),
//       };
//     } else if (date_range === 'monthly') {
//       const currentDate = new Date();
//       const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//       const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
//       matchQuery['activities.createdAt'] = {
//         $gte: new Date(startOfMonth.setHours(0, 0, 0)),
//         $lt: new Date(endOfMonth.setHours(23, 59, 59)),
//       };
//     } else if (date_range === 'yearly') {
//       const currentDate = new Date();
//       const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
//       const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
//       matchQuery['activities.createdAt'] = {
//         $gte: new Date(startOfYear.setHours(0, 0, 0)),
//         $lt: new Date(endOfYear.setHours(23, 59, 59)),
//       };
//     }

//     const result = await userModel.aggregate([
//       {
//         $match: matchQuery,
//       },
//       {
//         $lookup: {
//           from: 'exercise-activities',
//           localField: 'exercise_activities._id',
//           foreignField: '_id',
//           as: 'activities',
//         },
//       },
//       {
//         $unwind: '$activities',
//       },
//       {
//         $group: {
//           _id: '$activities.activity_type_id',
//           count: { $sum: 1 },
//           totalCalories: { $sum: '$activities.calories' },
//           totalDuration: { $sum: { $add: [{ $multiply: ['$activities.hour', 60] }, '$activities.minute'] } },
//           totalDistance: { $sum: '$activities.distance' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           activity_type_name: '$_id',
//           calories: '$totalCalories',
//           duration: { $divide: ['$totalDuration', 60] }, // Convert total duration to hours
//           distance: '$totalDistance',
//         },
//       },
//     ]);

//     // Organize data for response
//     const series = [
//       { name: 'Calories', data: result.map((activity) => activity.calories || 0) },
//       { name: 'Duration', data: result.map((activity) => activity.duration || 0) },
//       { name: 'Distance', data: result.map((activity) => activity.distance || 0) },
//     ];

//     const data = {
//       date_range: date_range,
//       series: series,
//     };

//     res.status(200).send({
//       success: true,
//       message: `${date_range.charAt(0).toUpperCase() + date_range.slice(1)} Exercise Activity by ${user_id} get successfully`,
//       data: data,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: 'Internal server error',
//       error: error,
//     });
//   }
// };

export default {
  getsummaryCardByUserId,
  getActivitiesTypeByUserId,
  getGraphSummaryDataByUserId,
};
