import mongoose from 'mongoose';
import activityTypeController from '../activityType/activityType.controller.js';
import userModel from '../users/user.model.js';

const getsummaryCardByUserId = async (req, res) => {
  // #swagger.tags = ['Dashboard']

  try {
    const { user_id } = req.params;
    const { range } = req.query;
    let startDate, endDate;
    switch (range) {
      case 'today':
        // ช่วงรายชั่วโมง
        startDate = new Date();
        endDate = new Date();
        startDate.setHours(startDate.getHours() - 1);
        break;
      case 'weekly':
        // ช่วงย้อนหลัง 7 วัน
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'monthly':
        // ช่วงรายเดือน
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'yearly':
        // ช่วงรายปี
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        break;
      default:
        // ค่าเริ่มต้นหากไม่ระบุ range
        startDate = null;
        endDate = null;
    }

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
        $match: { 'activities.date': { $gte: startDate, $lte: endDate } }, // Filter activities within the specified date range
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
      totalDistance: totalDistance,
      totalCalories: totalDistance,
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
    const { date_range } = req.query; // Assuming date_range is passed as a query parameter
    console.log("donut_date_range: ", date_range)
    let startDate, endDate;
     // Based on the date range provided, adjust the matchQuery accordingly
    if (date_range === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Set time to beginning of the day
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // Set time to end of the day

      endDate = todayEnd
      startDate = todayStart
    } else if (date_range === 'weekly') {
      // ช่วงย้อนหลัง 7 วัน
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
    } else if (date_range === 'monthly') {
      // ช่วงรายเดือน
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (date_range === 'yearly') {
      // ช่วงรายปี
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    } else {
      // Invalid date range provided
      return res.status(400).send({
        success: false,
        message: 'Invalid date range provided',
      });
    }

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
        $match: { 'activities.date': { $gte: startDate, $lte: endDate } }, // Filter activities within the specified date range
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

    //mock data result
    const data = {
      date_range: date_range,
      chart_datas: updatedResult, // Use the updatedResult here
    };

    res.status(200).send({
      success: true,
      message: 'get Activities By UserId successfully',
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
    const { user_id } = req.params;
    console.log(user_id)
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
          totalDistance: { $sum: '$activities.distance' },
        },
      },
      {
        $project: {
          _id: 0,
          activity_type_name: '$_id',
          calories: '$totalCalories',
          duration: { $divide: ['$totalDuration', 60] }, // Convert total duration to hours
          distance: '$totalDistance',
        },
      },
    ]);

    // Organize data for response
    const series = [
      { name: 'Calories', data: result.map((activity) => activity.calories || 0) },
      { name: 'Duration', data: result.map((activity) => activity.duration || 0) },
      { name: 'Distance', data: result.map((activity) => activity.distance || 0) },
    ];

    const data = {
      date_range: 'Weekly',
      series: series,
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

//try it out!!
// const getsummaryForLast7Days = async (req, res) => {
//   try {

//     const date_range = req.body;
//     // Calculate startDate and endDate
//     const endDate = new Date(); // Today
//     const startDate = new Date();

//     if(date_range === 'today'){
//       startDate.setDate(startDate.getDate()); // today
//     }else if(date_range === 'weekly'){
//       startDate.setDate(startDate.getDate() - 6); // 6 days ago
//     }else if (date_range === 'monthly'){
//       startDate.setDate(startDate.getDate() - 30); // 30 days ago
//     }else if (date_range === 'yearly'){
//       startDate.setDate(startDate.getDate() - 365); // 365 days ago
//     }

//     const result = await userModel.aggregate([
//       {
//         $match: { _id: new mongoose.Types.ObjectId(user_id) }, // Use the user_id from request params
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
//         $match: { 'activities.date': { $gte: startDate, $lte: endDate } }, // Filter activities within the specified date range
//       },
//       {
//         $group: {
//           _id: '$_id',
//           totalHours: { $sum: '$activities.hour' },
//           totalMinutes: { $sum: '$activities.minute' },
//           totalDistance: { $sum: '$activities.distance' },
//           totalCalories: { $sum: '$activities.calories' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           user_id: '$_id',
//           totalHours: 1,
//           totalMinutes: 1,
//           totalDistance: 1,
//           totalCalories: 1,
//         },
//       },
//     ]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

const getdataByDateRange = async (req, res) => {
  try {
    const { user_id } = req.param;
    let startDate, endDate;

    // กำหนดช่วงเวลาตามความต้องการ
    const { date_range } = req.query;
    switch (date_range) {
      case 'today':
        // ช่วงรายชั่วโมง
        startDate = new Date();
        endDate = new Date();
        startDate.setHours(startDate.getHours() - 1);
        break;
      case 'weekly':
        // ช่วงย้อนหลัง 7 วัน
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case 'monthly':
        // ช่วงรายเดือน
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'yearly':
        // ช่วงรายปี
        const currentYear = new Date().getFullYear();
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31);
        break;
      default:
        // ค่าเริ่มต้นหากไม่ระบุ range
        startDate = null;
        endDate = null;
    }

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
        $match: { 'activities.date': { $gte: startDate, $lte: endDate } }, // Filter activities within the specified date range
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

export default {
  getsummaryCardByUserId,
  getActivitiesTypeByUserId,
  getGraphSummaryDataByUserId,
  getdataByDateRange,
};
