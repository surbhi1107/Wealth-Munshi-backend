const Contact = require("../models/contact");
const Familymember = require("../models/familymember");
const Partner = require("../models/partner");

const getdashboarddata = async (req, res, next) => {
  try {
    let data = await Partner.find({ user_id: req.user._id });
    let memberData = await Familymember.find({
      $and: [{ user_id: req.user?._id }, { type: { $ne: "self" } }],
    });
    let contactData = await Contact.find({ user_id: req.user._id });
    return res.send({
      success: true,
      partners: data,
      members: memberData,
      contacts: contactData,
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .send({ success: false, error: { error: "Internal server error" } });
  }
};

module.exports = { getdashboarddata };
