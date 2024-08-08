const Question = require("../models/question");

const addQuestion = async (req, res, next) => {
  try {
    let {
      type,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      answer,
    } = req?.body;
    let success = false;
    if (question && answer) {
      let que = await Question.create({
        type,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        option_e,
        answer,
      });
      if (!que?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: que });
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

const getquestionbyid = async (req, res, next) => {
  try {
    let questionId = req.body?.questionId;
    let success = false;
    if (!questionId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let que = await Question.findOne({
      $and: [{ _id: questionId }, { user_id: req.user?._id }],
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

const updatequestion = async (req, res, next) => {
  try {
    let questionId = req.body?.questionId;
    let success = false;
    let { details } = req.body;
    if (!questionId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const que = await Question.findOne({
      $and: [{ _id: questionId }, { user_id: req.user?._id }],
    });
    if (que) {
      await Question.findByIdAndUpdate(questionId, {
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

const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = req.body?.questionId;
    let success = false;
    const findQuestion = await Question.findOne({
      $and: [{ _id: questionId }, { user_id: req.user?._id }],
    });
    if (!findQuestion) {
      return res.status(400).send({ success, error: "Data Not Found" });
    }
    let deleted = await Question.findByIdAndDelete(questionId);
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

const getallquestions = async (req, res, next) => {
  try {
    let data = await Question.find({ user_id: req.user._id });
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addQuestion,
  updatequestion,
  getquestionbyid,
  deleteQuestion,
  getallquestions,
};
