import mongoose from 'mongoose';
import activityTypeController from '../activityType/activityType.controller.js';
import userModel from '../users/user.model.js';

const getsummaryCardByUserId = async (req, res) => {
  // #swagger.tags = ['Dashboard']

  try {
    const { user_id } = req.params;
    const { date_range } = req.query;
    let startDate, endDate;
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
          _id: '$activities.activity_type_id',
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
      totalCalories: totalCalories.toFixed(2),
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
    const { date_range } = req.query;

    let startDate, endDate, dateFormat, groupBy;
    let categories = [];

    // Based on the date range provided, adjust the matchQuery accordingly
    if (date_range === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Set time to beginning of the day
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // Set time to end of the day
      dateFormat = '%H'; // Group by hour
      groupBy = { $hour: '$activities.date' };
    } else if (date_range === 'weekly') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6); // 7 days ago
      endDate = new Date();
      dateFormat = '%a'; // Group by day of week
      groupBy = { $dayOfWeek: '$activities.date' };
    } else if (date_range === 'monthly') {
      startDate = new Date();
      startDate.setDate(1); // Start of the month
      endDate = new Date();
      dateFormat = '%U'; // Group by week of the month
      groupBy = {
        $add: [
          { $divide: [{ $subtract: ['$activities.date', startDate] }, 1000 * 60 * 60 * 24 * 7] },
          1
        ]
      };
    } else if (date_range === 'yearly') {
      startDate = new Date();
      startDate.setMonth(0, 1); // Start of the year
      endDate = new Date();
      endDate.setMonth(11, 31); // End of the year
      dateFormat = '%m'; // Group by month
      groupBy = { $month: '$activities.date' };
    } else {
      // Invalid date range provided
      return res.status(400).send({
        success: false,
        message: 'Invalid date range provided',
      });
    }

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
        $match: { 'activities.date': { $gte: startDate, $lte: endDate } }, // Filter activities within the specified date range
      },
      {
        $group: {
          _id: groupBy,
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

    // Adjust categories based on dateFormat
    result.forEach((activity) => {
      let formattedDate;
      if (date_range === 'today') {
        formattedDate = activity.activity_type_name < 10 ? `0${activity.activity_type_name}:00` : `${activity.activity_type_name}:00`;
      } else if (date_range === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        formattedDate = days[activity.activity_type_name - 1];
      } else if (date_range === 'monthly') {
        formattedDate = `Week ${activity.activity_type_name}`;
        // formattedDate = `Week ${activity.activity_type_name + 1}`;
      } else if (date_range === 'yearly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        formattedDate = months[activity.activity_type_name - 1];
      }
      categories.push(formattedDate);
    });

    // Organize data for response
    const series = [
      { name: 'Calories', data: result.map((activity) => activity.calories || 0) },
      { name: 'Duration', data: result.map((activity) => activity.duration || 0) },
      { name: 'Distance', data: result.map((activity) => activity.distance || 0) },
    ];

    const data = {
      date_range: date_range,
      categories: categories,
      series: series,
    };

    res.status(200).send({
      success: true,
      message: `get Exercise Activity by ${user_id} successfully`,
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
