const Saving = require("../models/saving");

const addsaving = async (req, res, next) => {
  try {
    let {
      type,
      name,
      amount,
      inflation,
      isin_cashflow,
      start_timeline,
      end_timeline,
      asset_id,
    } = req?.body;
    let success = false;
    if (type && start_timeline?.date && end_timeline?.date) {
      let saving = await Saving.create({
        type,
        name,
        amount,
        inflation,
        isin_cashflow,
        start_timeline,
        end_timeline,
        asset_id,
        user_id: req.user._id,
      });
      if (!saving?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      success = true;
      return res.send({ success, data: saving });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getsavingbyid = async (req, res, next) => {
  try {
    let savingId = req.body?.savingId;
    let success = false;
    if (!savingId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let saving = await Saving.aggregate([
      { $and: [{ _id: savingId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "asset",
          localField: "asset_id",
          foreignField: "_id",
          as: "asset_id",
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
    if (!saving) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: saving?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updatesaving = async (req, res, next) => {
  try {
    let savingId = req.body?.savingId;
    let success = false;
    let { details } = req.body;
    if (!savingId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const saving = await Saving.findOne({
      $and: [{ _id: savingId }, { user_id: req.user?._id }],
    });
    if (saving) {
      await Saving.findByIdAndUpdate(savingId, {
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

const deletesaving = async (req, res, next) => {
  try {
    const savingId = req.body?.savingId;
    let success = false;
    const findSaving = await Saving.findOne({
      $and: [{ _id: savingId }, { user_id: req.user?._id }],
    });
    if (!findSaving) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Saving.findByIdAndDelete(savingId);
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

const getallsavings = async (req, res, next) => {
  try {
    let data = await Saving.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "asset",
          localField: "asset_id",
          foreignField: "_id",
          as: "asset_id",
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
    return res.send({ data });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = {
  addsaving,
  getsavingbyid,
  updatesaving,
  deletesaving,
  getallsavings,
};
