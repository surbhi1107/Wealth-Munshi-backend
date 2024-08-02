const { mongoose } = require("mongoose");
const Goal = require("../models/goal");

const addgoal = async (req, res, next) => {
  try {
    let {
      type,
      name,
      amount,
      inflation,
      is_longterm_goal,
      priority,
      goal_often,
      start_timeline,
      end_timeline,
    } = req?.body;
    let success = false;
    if (type && start_timeline && amount) {
      let goal = await Goal.create({
        type,
        name,
        amount,
        inflation,
        is_longterm_goal,
        priority,
        user_id: req.user._id,
        start_timeline,
        end_timeline,
        goal_often,
      });
      if (!goal?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: goal });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getgoalbyid = async (req, res, next) => {
  try {
    let goalId = req.body?.goalId;
    let success = false;
    if (!goalId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    goalId = new mongoose.Types.ObjectId(goalId);
    let goal = await Goal.aggregate([
      { $match: { $and: [{ _id: goalId }, { user_id: req.user?._id }] } },
      {
        $lookup: {
          from: "familymembers",
          localField: "start_timeline.member",
          foreignField: "_id",
          as: "start_member",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "end_timeline.member",
          foreignField: "_id",
          as: "end_member",
        },
      },
      {
        $addFields: {
          start_member: {
            $first: "$start_member",
          },
          end_member: {
            $first: "$end_member",
          },
        },
      },
    ]);
    if (!goal) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: goal?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updategoal = async (req, res, next) => {
  try {
    let goalId = req.body?.goalId;
    let success = false;
    let { details } = req.body;
    if (!goalId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const goal = await Goal.findOne({
      $and: [{ _id: goalId }, { user_id: req.user?._id }],
    });
    if (goal) {
      await Goal.findByIdAndUpdate(goalId, {
        $set: details,
      });
      success = true;
      res.status(200).send({ success });
    } else {
      return res.status(400).send("Data Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const deletegoal = async (req, res, next) => {
  try {
    const goalId = req.body?.goalId;
    let success = false;
    const findGoal = await Goal.findOne({
      $and: [{ _id: goalId }, { user_id: req.user?._id }],
    });
    if (!findGoal) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Goal.findByIdAndDelete(goalId);
    if (!deleted?._id) {
      success = false;
      return res.status(500).send({ success, msg: "delete unsuccessfully" });
    }
    success = true;
    return res.send({ success, msg: "delete successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getallgoals = async (req, res, next) => {
  try {
    let data = await Goal.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymembers",
          localField: "start_timeline.member",
          foreignField: "_id",
          as: "start_member",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "end_timeline.member",
          foreignField: "_id",
          as: "end_member",
        },
      },
      {
        $addFields: {
          start_member: {
            $first: "$start_member",
          },
          end_member: {
            $first: "$end_member",
          },
        },
      },
    ]);
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addgoal,
  getgoalbyid,
  updategoal,
  deletegoal,
  getallgoals,
};
