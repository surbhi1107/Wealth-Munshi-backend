const UserExpense = require("../models/user-expense");

const updateUserExpense = async (req, res, next) => {
  try {
    let expenseId = req.body?.expenseId;
    let success = false;
    let { details } = req.body;
    if (!expenseId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const data = await UserExpense.findOne({
      $and: [{ _id: expenseId }, { user_id: req.user?._id }],
    });
    if (data) {
      await UserExpense.findByIdAndUpdate(expenseId, {
        $set: details,
      });
      success = true;
      res.status(200).send({ success });
    } else {
      return res.status(400).send({ success: false, error: "Data Not Found" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getuserexpensebyid = async (req, res, next) => {
  try {
    let expenseId = req.body?.expenseId;
    let success = false;
    if (!expenseId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let que = await UserExpense.findOne({
      $and: [{ _id: expenseId }, { user_id: req.user?._id }],
    });
    if (!que) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: que });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const resetUserExpense = async (req, res, next) => {
  try {
    const expenseId = req.body?.expenseId;
    let success = false;
    const findexpense = await UserExpense.findById(expenseId);
    if (!findexpense) {
      return res.status(400).send({ success, error: "Data Not Found" });
    }
    let reset = await UserExpense.findByIdAndUpdate(expenseId, {
      $set: {},
    });
    if (!reset?._id) {
      success = false;
      return res
        .status(500)
        .send({ success, msg: "data reset unsuccessfully" });
    }
    success = true;
    return res.send({ success, msg: "data reset successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getallUserExpenses = async (req, res, next) => {
  try {
    let condition = {};
    let living_type = req?.body?.living_type;
    if (living_type !== undefined) {
      condition = {
        $and: [{ user_id: req.user._id }, { living_expense_type: living_type }],
      };
    } else {
      condition = { user_id: req.user._id };
    }
    let data = await UserExpense.find({ ...condition });
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  updateUserExpense,
  getuserexpensebyid,
  resetUserExpense,
  getallUserExpenses,
};
