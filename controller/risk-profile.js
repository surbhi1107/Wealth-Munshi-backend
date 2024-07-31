const Partner = require("../models/partner");

const getQuestionaries = async (req, res, next) => {
  try {
    let userId = req.user?._id;
    let success = false;
    let partner = await Partner.find({ user_id: userId });
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

const getPartnerQuestionaries = async (req, res, next) => {
  try {
    let userId = req.user?._id;
    let partnerId = req.body?.partnerId;
    let success = false;
    if (!partnerId) {
      return res.status(400).send({ success, error: "All fields are require" });
    }
    let partner = await Partner.findById(partnerId);
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

const updateQuestionaries = async (req, res, next) => {
  try {
    let questionaries = req.body?.details;
    let partnerId = req.body?.partnerId;
    let success = false;
    if (!partnerId || !questionaries) {
      return res.status(400).send({ success, error: "All fields are require" });
    }
    let partner = await Partner.findById(partnerId);
    partner = delete partner?.questionaries;
    if (!partner) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    let newpartner = await Partner.findByIdAndUpdate(partnerId, {
      $set: {
        ...partner,
        questionaries: { ...questionaries },
      },
    });
    success = true;
    return res.send({ success, data: partner });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  getQuestionaries,
  getPartnerQuestionaries,
  updateQuestionaries,
};
