const { default: mongoose } = require("mongoose");
const Liability = require("../models/liability");
const Payment = require("../models/payment");

const addpayment = async (req, res, next) => {
  try {
    let {
      type,
      name,
      amount,
      inflation,
      next_payment_start,
      next_payment_end,
      payment_time,
      isin_cashflow,
      liability_id,
    } = req?.body;
    let success = false;
    if (type && amount && next_payment_start?.date) {
      let payment = await Payment.create({
        type,
        name,
        amount,
        inflation,
        next_payment_start,
        next_payment_end,
        payment_time,
        isin_cashflow,
        ...(liability_id?.length > 0 ? { liability_id: liability_id } : {}),
        user_id: req.user._id,
      });
      if (!payment?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      if (liability_id?.length > 0) {
        const liability = await Liability.findOne({
          $and: [{ _id: liability_id }, { user_id: req.user?._id }],
        });
        let newpayids = liability.payment_ids ?? [];
        let newLiability = await Liability.findByIdAndUpdate(liability?._id, {
          $set: {
            ...liability,
            payment_ids: [...newpayids, payment?._id],
          },
        });
        success = true;
        return res.send({ success, data: payment });
      } else {
        success = true;
        return res.send({ success, data: payment });
      }
    } else {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const getpaymentbyid = async (req, res, next) => {
  try {
    let paymentId = req.body?.paymentId;
    let success = false;
    if (!paymentId) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    let payment = await Payment.aggregate([
      {
        $match: {
          $and: [
            { _id: new mongoose.Types.ObjectId(paymentId) },
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
    console.log(paymentId);
    if (!payment) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: payment?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const updatepayment = async (req, res, next) => {
  try {
    let paymentId = req.body?.paymentId;
    let success = false;
    let { details } = req.body;
    if (!paymentId || !details) {
      return res
        .status(500)
        .send({ success, error: "All fields are required" });
    }
    details = { ...details, user_id: req.user._id };
    const payment = await Payment.findOne({
      $and: [{ _id: paymentId }, { user_id: req.user?._id }],
    });
    if (payment) {
      await Payment.findByIdAndUpdate(paymentId, {
        $set: details,
      });
      success = true;
      res.status(200).send({ success });
    } else {
      return res.status(400).send({ success: false, error: "Data Not Found" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

const deletepayment = async (req, res, next) => {
  try {
    const paymentId = req.body?.paymentId;
    let success = false;
    const findPayment = await Payment.findOne({
      $and: [{ _id: paymentId }, { user_id: req.user?._id }],
    });
    if (!findPayment) {
      return res.status(400).send({ success, error: "Data Not Found" });
    }
    let deleted = await Payment.findByIdAndDelete(paymentId);
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

const getallpaymentsbyliability = async (req, res, next) => {
  try {
    let data = await Payment.aggregate([
      { $match: { user_id: req.user._id } },
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
        $addFields: {
          liability: {
            $first: "$liability",
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
  addpayment,
  getpaymentbyid,
  updatepayment,
  deletepayment,
  getallpaymentsbyliability,
};
