const Income = require("../models/income");

const addincome = async (req, res, next) => {
  try {
    let {
      type,
      name,
      income_owner,
      amount,
      income_duration,
      growth_rate,
      start_time,
      end_time,
      use_for_living_expenses,
      timeline_desc,
      user_recommended,
    } = req?.body;
    let success = false;
    if (type && start_time && end_time) {
      let income = await Income.create({
        type,
        name,
        income_owner,
        amount,
        income_duration,
        growth_rate,
        start_time,
        end_time,
        use_for_living_expenses,
        timeline_desc,
        user_recommended,
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
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
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
      { $and: [{ _id: incomeId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "familymember",
          localField: "income_owner",
          foreignField: "_id",
          as: "income_owner",
        },
      },
      {
        $lookup: {
          from: "familymember",
          localField: "user_recommended",
          foreignField: "_id",
          as: "user_recommended",
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
    return res.status(500).send("Internal server error");
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
      res.status(200).send({ success });
    } else {
      return res.status(400).send("Data Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const deleteincome = async (req, res, next) => {
  try {
    const incomeId = req.body?.incomeId;
    let success = false;
    const findIncome = await Income.findOne({
      $and: [{ _id: incomeId }, { user_id: req.user?._id }],
    });
    if (!findIncome) {
      return res.status(400).send({ success, msg: "Data Not Found" });
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
    return res.status(500).send("Internal server error");
  }
};

const getallincomes = async (req, res, next) => {
  try {
    let data = await Income.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymember",
          localField: "income_owner",
          foreignField: "_id",
          as: "income_owner",
        },
      },
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
  addincome,
  getincomebyid,
  updateincome,
  deleteincome,
  getallincomes,
};
