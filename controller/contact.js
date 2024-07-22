const Contact = require("../models/contact");

const addcontact = async (req, res, next) => {
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
      let contact = await Contact.create({
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
      if (!contact?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: contact });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const getcontactbyid = async (req, res, next) => {
  try {
    let contactId = req.body?.contactId;
    let success = false;
    if (!contactId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let contact = await Contact.findOne({
      $and: [{ _id: contactId }, { user_id: req.user?._id }],
    });
    if (!contact) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: contact });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const updatecontact = async (req, res, next) => {
  try {
    let contactId = req.body?.contactId;
    let success = false;
    let { details } = req.body;
    if (!contactId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const contact = await Contact.findOne({
      $and: [{ _id: contactId }, { user_id: req.user?._id }],
    });
    if (contact) {
      await Contact.findByIdAndUpdate(contactId, {
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

const deletecontact = async (req, res, next) => {
  try {
    const contactId = req.body?.contactId;
    let success = false;
    const findContact = await Contact.findOne({
      $and: [{ _id: contactId }, { user_id: req.user?._id }],
    });
    if (!findContact) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Contact.findByIdAndDelete(contactId);
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

const getallcontacts = async (req, res, next) => {
  try {
    let data = await Contact.aggregate([{ $match: { user_id: req.user._id } }]);
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  addcontact,
  updatecontact,
  getcontactbyid,
  deletecontact,
  getallcontacts,
};
