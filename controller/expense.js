const Expense = require("../models/expense");

const addExpense = async (req, res, next) => {
  try {
    let { type, name, amount, inflation, isInflation, timeline } = req?.body;
    let success = false;
    if (type && name) {
      let find = await Expense.findOne({
        $and: [{ type: type }, { name: name }],
      });
      if (find?._id) {
        return res.status(400).send({ success, error: "Data already exists." });
      }
      let data = await Expense.create({
        type,
        name,
        amount,
        inflation,
        isInflation,
        timeline,
      });
      if (!data?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: data });
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

const getexpensebyid = async (req, res, next) => {
  try {
    let expenseId = req.body?.expenseId;
    let success = false;
    if (!expenseId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let data = await Expense.findById(expenseId);
    if (!data) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateExpense = async (req, res, next) => {
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
    const data = await Expense.findById(expenseId);
    if (data) {
      await Expense.findByIdAndUpdate(expenseId, {
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

const deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.body?.expenseId;
    let success = false;
    const findQuestion = await Expense.findById(expenseId);
    if (!findQuestion) {
      return res.status(400).send({ success, error: "Data Not Found" });
    }
    let deleted = await Expense.findByIdAndDelete(expenseId);
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

const getallexpenses = async (req, res, next) => {
  try {
    let data = await Expense.find();
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addExpense,
  updateExpense,
  getexpensebyid,
  deleteExpense,
  getallexpenses,
};
