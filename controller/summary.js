const Asset = require("../models/asset");
const Liability = require("../models/liability");

const getsummaryData = async (req, res, next) => {
  try {
    let resources = await Asset.aggregate([
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $addFields: {
          member: {
            $first: "$result",
          },
        },
      },
      {
        $project: {
          _id: "$_id",
          type: "$type",
          amount: "$curr_valuation",
          member: "$member",
          isAssest: "$isAssest",
        },
      },
    ]);
    let liabilities = await Liability.aggregate([
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $addFields: {
          member: {
            $first: "$result",
          },
        },
      },
      {
        $project: {
          _id: "$_id",
          type: "$type",
          amount: "$curr_amount",
          member: "$member",
          isAssest: "$isAssest",
        },
      },
    ]);
    return res.send({
      success: true,
      data: {
        assets: resources ?? [],
        liabilities: liabilities ?? [],
      },
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .send({ success: false, error: { error: "Internal server error" } });
  }
};

module.exports = { getsummaryData };
