const { default: mongoose } = require("mongoose");
const Liability = require("../models/liability");
const Payment = require("../models/payment");

const addliability = async (req, res, next) => {
  try {
    let {
      type,
      name,
      curr_amount,
      interest,
      // total_amount,
      owner,
      // isPaid,
      payment_details,
    } = req?.body;
    let success = false;
    if (type && curr_amount) {
      let liability = await Liability.create({
        type,
        name,
        curr_amount,
        interest,
        // total_amount,
        owner,
        // isPaid,
        user_id: req.user._id,
      });
      if (!liability?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      if (payment_details) {
        let newpayments = payment_details?.map((v) => {
          return {
            type: v?.type,
            name: v?.name,
            amount: v?.amount,
            timeline: v?.timeline,
            inflation: v?.inflation,
            next_payment_start: v?.next_payment_start,
            next_payment_end: v?.next_payment_end,
            isin_cashflow: v?.isin_cashflow,
            liability_id: liability?._id,
            user_id: req.user._id,
          };
        });
        let donePayment = await Payment.insertMany([...newpayments]);
        if (!donePayment?.length > 0) {
          return res.status(400).send({
            success,
            data: { liability },
            error:
              "Liability added but payment not added please try again later.",
          });
        }
        success = true;
        return res.send({
          success,
          data: { liability, payments: donePayment },
        });
      } else {
        success = true;
        return res.send({ success, data: { liability } });
      }
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

const getliabilitybyid = async (req, res, next) => {
  try {
    let liabilityId = req.body?.liabilityId;
    let success = false;
    if (!liabilityId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let liability = await Liability.aggregate([
      {
        $match: {
          $and: [
            { _id: new mongoose.Types.ObjectId(liabilityId) },
            { user_id: req.user?._id },
          ],
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
    ]);
    let payments = await Payment.aggregate([
      {
        $match: {
          $and: [
            { liability_id: new mongoose.Types.ObjectId(liabilityId) },
            { user_id: req.user?._id },
          ],
        },
      },
      {
        $lookup: {
          from: "liabilities",
          localField: "liability_id",
          foreignField: "_id",
          as: "liability",
          pipeline: [
            {
              $lookup: {
                from: "familymembers",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "next_payment_start.member",
          foreignField: "_id",
          as: "next_payment_start.member",
        },
      },
      {
        $lookup: {
          from: "familymembers",
          localField: "next_payment_end.member",
          foreignField: "_id",
          as: "next_payment_end.member",
        },
      },
      {
        $addFields: {
          liability: {
            $first: "$liability",
          },
          "next_payment_start.member": {
            $first: "$next_payment_start.member",
          },
          "next_payment_end.member": {
            $first: "$next_payment_end.member",
          },
        },
      },
    ]);
    if (liability?.length === 0) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: { ...liability?.[0], payments } ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updateliability = async (req, res, next) => {
  try {
    let liabilityId = req.body?.liabilityId;
    let payment_details = req.body?.payment_details;
    let success = false;
    let { details } = req.body;
    if (!liabilityId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const liability = await Liability.findOne({
      $and: [{ _id: liabilityId }, { user_id: req.user?._id }],
    });
    if (liability) {
      let updatedLiability = await Liability.findByIdAndUpdate(liabilityId, {
        $set: details,
      });
      if (!updatedLiability?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      } else {
        if (payment_details) {
          let newPayment = {
            type: payment_details?.type,
            name: payment_details?.name,
            amount: payment_details?.amount,
            inflation: payment_details?.inflation,
            next_payment_start: payment_details?.next_payment_start,
            next_payment_end: payment_details?.next_payment_end,
            payment_time: payment_details?.payment_time,
            isin_cashflow: payment_details?.isin_cashflow,
            liability_id: updatedLiability?._id,
            user_id: req.user._id,
          };
          let donePayment = await Payment.create({
            ...newPayment,
          });
          if (!donePayment?._id) {
            return res.status(400).send({
              success,
              data: { liability: updatedLiability },
              error:
                "Liability Updated but payment not added please try again later.",
            });
          } else {
            let newLiability = await Liability.findByIdAndUpdate(liabilityId, {
              $set: {
                ...updatedLiability,
                payment_ids: [
                  ...updatedLiability.payment_ids,
                  donePayment?._id,
                ],
              },
            });
            success = true;
            return res.send({
              success,
              data: { liability: newLiability, payments: donePayment },
            });
          }
        } else {
          success = true;
          res.status(200).send({ success });
        }
      }
    } else {
      return res.status(400).send("Data Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const deleteliability = async (req, res, next) => {
  try {
    const liabilityId = req.body?.liabilityId;
    let success = false;
    const findLiability = await Liability.findOne({
      $and: [{ _id: liabilityId }, { user_id: req.user?._id }],
    });
    let findpayments = await Payment.find({
      $and: [{ liability_id: liabilityId }],
    });
    let ids = findpayments?.map((v) => {
      return v?._id;
    });
    if (!findLiability) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Liability.findByIdAndDelete(liabilityId);
    let deletedpayments = await Payment.deleteMany({ _id: { $in: ids } });
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

const getallliabilities = async (req, res, next) => {
  try {
    let data = await Liability.aggregate([
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
        $addFields: {
          owner: {
            $first: "$owner",
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
  addliability,
  getliabilitybyid,
  updateliability,
  deleteliability,
  getallliabilities,
};
