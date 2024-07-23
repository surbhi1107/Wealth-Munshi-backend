const Goal = require("../models/goal");

const addgoal = async (req, res, next) => {
  try {
    let {
      type,
      name,
      inflation,
      is_longterm_goal,
      start_time,
      end_time,
      priority,
      timeline_desc,
      goal_often,
      user_recommended,
    } = req?.body;
    let success = false;
    if (type && start_time && end_time) {
      let goal = await Goal.create({
        type,
        name,
        inflation,
        is_longterm_goal,
        start_time,
        end_time,
        priority,
        user_id: req.user._id,
        user_recommended,
        timeline_desc,
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
    return res.status(500).send("Internal server error");
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
    let goal = await Goal.aggregate([
      { $and: [{ _id: goalId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "familymember",
          localField: "user_recommended",
          foreignField: "_id",
          as: "user_recommended",
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
    return res.status(500).send("Internal server error");
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
      await goal.findByIdAndUpdate(goalId, {
        $set: details,
      });
      success = true;
      res.status(200).send({ success });
    } else {
      return res.status(400).send("Data Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
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
    return res.status(500).send("Internal server error");
  }
};

const getallgoals = async (req, res, next) => {
  try {
    let data = await Goal.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymember",
          localField: "user_recommended",
          foreignField: "_id",
          as: "user_recommended",
        },
      },
    ]);
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  addgoal,
  getgoalbyid,
  updategoal,
  deletegoal,
  getallgoals,
};
