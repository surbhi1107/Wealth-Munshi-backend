const Asset = require("../models/asset");

const addasset = async (req, res, next) => {
  try {
    let {
      type,
      name,
      curr_valuation,
      owner,
      goals,
      surplus_goals,
      start_time,
      isAssest,
      timeline_desc,
      user_recommended,
    } = req?.body;
    let success = false;
    if (type && curr_valuation && owner && req.user?._id) {
      let asset = await Asset.create({
        type,
        name,
        curr_valuation,
        owner,
        goals,
        surplus_goals,
        start_time,
        isAssest,
        timeline_desc,
        user_id: req.user?._id,
        user_recommended,
      });
      if (!asset?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: asset });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const getassetbyid = async (req, res, next) => {
  try {
    let assetId = req.body?.assetId;
    let success = false;
    if (!assetId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let asset = await Asset.aggregate([
      { $and: [{ _id: assetId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "familymember",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
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
    if (!asset) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: asset?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const updateasset = async (req, res, next) => {
  try {
    let assetId = req.body?.assetId;
    let success = false;
    let { details } = req.body;
    if (!assetId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const asset = await Asset.findOne({
      $and: [{ _id: assetId }, { user_id: req.user?._id }],
    });
    if (asset) {
      await Asset.findByIdAndUpdate(assetId, {
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

const deleteasset = async (req, res, next) => {
  try {
    const assetId = req.body?.assetId;
    let success = false;
    const findAsset = await Asset.findOne({
      $and: [{ _id: assetId }, { user_id: req.user?._id }],
    });
    if (!findAsset) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Asset.findByIdAndDelete(assetId);
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

const getallassets = async (req, res, next) => {
  try {
    let data = await Asset.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymember",
          localField: "owner",
          foreignField: "_id",
          as: "user_recommended",
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
      // Unwind the source
      { $unwind: "$goals" },
      // Do the lookup matching
      {
        $lookup: {
          from: "goal",
          localField: "goal",
          foreignField: "_id",
          as: "goals",
        },
      },
      // Unwind the result arrays ( likely one or none )
      { $unwind: "$goals" },
      // Group back to arrays
      {
        $group: {
          _id: "$_id",
          goals: { $push: "$goals" },
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
  addasset,
  getassetbyid,
  updateasset,
  deleteasset,
  getallassets,
};
