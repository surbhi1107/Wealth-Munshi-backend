const { default: mongoose } = require("mongoose");
const Income = require("../models/income");

const addincome = async (req, res, next) => {
  try {
    let {
      type,
      name,
      income_owner,
      amount,
      timeline,
      growth_rate,
      income_start,
      income_end,
      use_for_living_expenses,
      goal_state,
      goals,
    } = req?.body;
    let success = false;
    if (type && income_start && income_end) {
      let income = await Income.create({
        type,
        name,
        income_owner,
        amount,
        timeline,
        growth_rate,
        income_start,
        income_end,
        use_for_living_expenses,
        goal_state,
        goals,
        user_id: req.user._id,
      });
      if (!income?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: income });
    } else {
      return res
        .status(500)
        .send({ success: false, error: "All fields are required" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getincomebyid = async (req, res, next) => {
  try {
    let incomeId = req.body?.incomeId;
    let success = false;
    if (!incomeId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let income = await Income.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(incomeId) } },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_owner",
          foreignField: "_id",
          as: "income_owner",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goals",
          foreignField: "_id",
          as: "goals",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_start.member",
          foreignField: "_id",
          as: "income_start_member",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_end.member",
          foreignField: "_id",
          as: "income_end_member",
        },
      },
      {
        $addFields: {
          income_owner: {
            $first: "$income_owner",
          },
          income_start_member: {
            $first: "$income_start_member",
          },
          income_end_member: {
            $first: "$income_end_member",
          },
        },
      },
    ]);
    if (!income) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: income?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateincome = async (req, res, next) => {
  try {
    let incomeId = req.body?.incomeId;
    let success = false;
    let { details } = req.body;
    if (!incomeId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const income = await Income.findOne({
      $and: [{ _id: incomeId }, { user_id: req.user?._id }],
    });
    if (income) {
      await Income.findByIdAndUpdate(incomeId, {
        $set: details,
      });
      success = true;
      res.status(200).send({ success, msg: "data Updated successfully" });
    } else {
      return res.status(400).send({ success: false, error: "Data Not Found" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const deleteincome = async (req, res, next) => {
  try {
    const incomeId = req.body?.incomeId;
    let success = false;
    const findIncome = await Income.findById(incomeId);
    if (!findIncome) {
      return res.status(400).send({ success, error: "Data Not Found" });
    }
    let deleted = await Income.findByIdAndDelete(incomeId);
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

const getallincomes = async (req, res, next) => {
  try {
    let data = await Income.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_owner",
          foreignField: "_id",
          as: "income_owner",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goals",
          foreignField: "_id",
          as: "goals",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_start.member",
          foreignField: "_id",
          as: "income_start_member",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "income_end.member",
          foreignField: "_id",
          as: "income_end_member",
        },
      },
      {
        $addFields: {
          income_owner: {
            $first: "$income_owner",
          },
          income_start_member: {
            $first: "$income_start_member",
          },
          income_end_member: {
            $first: "$income_end_member",
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
  addincome,
  getincomebyid,
  updateincome,
  deleteincome,
  getallincomes,
};
