const { default: mongoose } = require("mongoose");
const Asset = require("../models/asset");

const addasset = async (req, res, next) => {
  try {
    let {
      type,
      name,
      curr_valuation,
      owner,
      isAssest,
      goals,
      surplus_goals = [],
      resources_access_time,
      goal_state,
      surplusgoal_state,
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
        isAssest,
        resources_access_time,
        user_id: req.user?._id,
        goal_state,
        surplusgoal_state,
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
    return res.status(500).send({ error: "Internal server error" });
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
    assetId = new mongoose.Types.ObjectId(assetId);
    let asset = await Asset.aggregate([
      { $match: { $and: [{ _id: assetId }, { user_id: req.user?._id }] } },
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "resources_access_time.member",
          foreignField: "_id",
          as: "start_member",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goals",
          foreignField: "_id",
          as: "goals",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "surplus_goals",
          foreignField: "_id",
          as: "surplus_goals",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          start_member: {
            $first: "$start_member",
          },
        },
      },
    ]);
    if (asset?.length === 0) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: asset?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
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
    return res.status(500).send({ error: "Internal server error" });
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
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getallassets = async (req, res, next) => {
  try {
    let condition = [];
    let isAssest = req?.body?.isAssest;
    if (isAssest !== undefined) {
      condition = [
        {
          $match: { $and: [{ user_id: req.user._id }, { isAssest: isAssest }] },
        },
      ];
    } else {
      condition = [{ $match: { user_id: req.user._id } }];
    }
    let data = await Asset.aggregate([
      ...condition,
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "resources_access_time.member",
          foreignField: "_id",
          as: "start_member",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goals",
          foreignField: "_id",
          as: "goals",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "surplus_goals",
          foreignField: "_id",
          as: "surplus_goals",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          start_member: {
            $first: "$start_member",
          },
        },
      },
    ]);
    return res.send({ success: true, data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getgoalresources = async (req, res, next) => {
  try {
    let data = await Asset.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "resources_access_time.member",
          foreignField: "_id",
          as: "start_member",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "goals",
          foreignField: "_id",
          as: "goals",
        },
      },
      {
        $lookup: {
          from: "goals",
          localField: "surplus_goals",
          foreignField: "_id",
          as: "surplus_goals",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          start_member: {
            $first: "$start_member",
          },
        },
      },
    ]);
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addasset,
  getassetbyid,
  updateasset,
  deleteasset,
  getallassets,
  getgoalresources,
};
