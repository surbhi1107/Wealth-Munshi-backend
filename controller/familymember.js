const Familymember = require("../models/familymember");

const addmember = async (req, res, next) => {
  try {
    let {
      type,
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
      let member = await Familymember.create({
        type,
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
      });
      if (!member?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: member });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const getmemberbyid = async (req, res, next) => {
  try {
    let memberId = req.body?.memberId;
    let success = false;
    if (!memberId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let member = await Familymember.findOne({
      $and: [{ _id: memberId }, { user_id: req.user?._id }],
    });
    if (!member) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: member });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const updatemember = async (req, res, next) => {
  try {
    let memberId = req.body?.memberId;
    let success = false;
    let { details } = req.body;
    if (!memberId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const member = await Familymember.findOne({
      $and: [{ _id: memberId }, { user_id: req.user?._id }],
    });
    if (member) {
      await Familymember.findByIdAndUpdate(memberId, {
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

const deletemember = async (req, res, next) => {
  try {
    const memberId = req.body?.memberId;
    let success = false;
    const findmember = Familymember.findOne({
      $and: [{ _id: memberId }, { user_id: req.user?._id }],
    });
    if (!findmember) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Familymember.findByIdAndDelete(memberId);
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

const getallmembers = async (req, res, next) => {
  try {
    let isDashboard = req.body?.is_dashboard ? true : false;
    let condition = {};
    if (isDashboard) {
      condition = {
        $and: [{ user_id: req.user?._id }, { type: { $ne: "self" } }],
      };
    }
    let data = await Familymember.find({ ...condition });
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  addmember,
  updatemember,
  getmemberbyid,
  deletemember,
  getallmembers,
};
