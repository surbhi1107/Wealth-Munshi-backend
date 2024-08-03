const Familymember = require("../models/familymember");
const Partner = require("../models/partner");
const Question = require("../models/question");

const addpartner = async (req, res, next) => {
  try {
    let {
      title,
      fname,
      mname,
      lname,
      gender,
      known_as,
      dob,
      age_retire,
      life_expectancy,
    } = req?.body;
    let success = false;
    if (fname && lname) {
      //add question to partner collection
      let findquestions = await Question.find()
        .select("-createdAt")
        .select("-updatedAt");
      let newquestion = [];
      findquestions.map((v) => {
        let newobj = {
          _id: v._id,
          type: v.type,
          question: v.question,
          option_a: v.option_a,
          option_b: v.option_b,
          option_c: v.option_c,
          option_d: v.option_d,
          option_e: v.option_e,
          answer: v.answer,
          selected: null,
        };
        newquestion = [...newquestion, { ...newobj }];
      });
      let queobj = {
        name: "MorningStar Questionnaire",
        questions: newquestion,
        total: newquestion?.length,
        score: null,
        is_ans_given: false,
      };

      // register user as a partner
      let details = {
        title,
        fname,
        mname,
        lname,
        gender,
        known_as,
        dob,
        age_retire,
        life_expectancy,
        user_id: req.user._id,
        questionaries: {
          ...queobj,
          for: fname,
        },
      };
      let partner = await Partner.create({
        ...details,
      });
      if (!partner?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      await Familymember.create({
        ...details,
        partner_id: partner?._id,
        type: "partner",
      });
      success = true;
      return res.send({ success, data: partner });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getpartnerbyid = async (req, res, next) => {
  try {
    let partnerId = req.body?.partnerId;
    let success = false;
    if (!partnerId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let partner = await Partner.findOne({
      $and: [{ _id: partnerId }, { user_id: req.user?._id }],
    });
    if (!partner) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: partner });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updatepartner = async (req, res, next) => {
  try {
    let partnerId = req.body?.partnerId;
    let success = false;
    let { details } = req.body;
    if (!partnerId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const partner = await Partner.findOne({
      $and: [{ _id: partnerId }, { user_id: req.user?._id }],
    });
    if (partner) {
      await Partner.findByIdAndUpdate(partnerId, {
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

const deletepartner = async (req, res, next) => {
  try {
    const partnerId = req.body?.partnerId;
    let success = false;
    const findPartner = await Partner.findOne({
      $and: [{ _id: partnerId }, { user_id: req.user?._id }],
    });
    let findpartnerinmember = await Familymember.findOne({
      $and: [{ partner_id: partnerId }, { user_id: req.user?._id }],
    });
    if (!findPartner) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Partner.findByIdAndDelete(partnerId);
    let deletedmember = await Familymember.findByIdAndDelete(
      findpartnerinmember?._id
    );
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

const getallpartners = async (req, res, next) => {
  try {
    let data = await Partner.aggregate([{ $match: { user_id: req.user._id } }]);
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getuserpartner = async (req, res, next) => {
  try {
    let userId = req.user?._id;
    let success = false;
    let partner = await Partner.findOne({
      $and: [{ user_id: userId }, { is_register_partner: true }],
    });
    if (!partner) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, partner: partner });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addpartner,
  updatepartner,
  getpartnerbyid,
  deletepartner,
  getallpartners,
  getuserpartner,
};
