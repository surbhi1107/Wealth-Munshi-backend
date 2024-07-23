const Liability = require("../models/liability");
const Payment = require("../models/payment");

const addpayment = async (req, res, next) => {
  try {
    let {
      type,
      name,
      amount,
      inflation,
      start_time,
      end_time,
      payment_time,
      isin_cashflow,
      timeline_desc,
      liability_id,
      user_recommended,
    } = req?.body;
    let success = false;
    if (type && start_time && end_time) {
      let payment = await Payment.create({
        type,
        name,
        amount,
        inflation,
        start_time,
        end_time,
        payment_time,
        isin_cashflow,
        timeline_desc,
        liability_id,
        user_recommended,
        user_id: req.user._id,
      });
      if (!payment?._id) {
        return res
          .status(400)
          .send({ success, error: "Something went wrong." });
      }
      const liability = await Liability.findOne({
        $and: [{ _id: liability_id }, { user_id: req.user?._id }],
      });
      let newLiability = await Liability.findByIdAndUpdate(liability?._id, {
        $set: {
          ...liability,
          payment_ids: [...liability.payment_ids, payment?._id],
        },
      });
      console.log("newLiability..", newLiability);
      success = true;
      return res.send({ success, data: payment });
    } else {
      return res.status(500).send("All fields are required");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
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
      { $and: [{ _id: paymentId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "liability",
          localField: "liability_id",
          foreignField: "_id",
          as: "liability_id",
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
    if (!payment) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: payment?.[0] ?? {} });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
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
      return res.status(400).send("Data Not Found");
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
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
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Payment.findByIdAndDelete(paymentId);
    if (!deleted?._id) {
      success = false;
      return res.status(500).send({ success, msg: "delete unsuccessfully" });
    }
    const liability = await Liability.findById(findPayment?.liability_id);
    let newPaymentIds = [...liability.payment_ids];
    newPaymentIds = newPaymentIds.filter((id) => id !== paymentId);
    let newLiability = await Liability.findByIdAndUpdate(liability?._id, {
      $set: {
        ...liability,
        payment_ids: [...newPaymentIds],
      },
    });
    console.log("newLiability..", newLiability);
    success = true;
    return res.send({ success, msg: "delete successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send("Internal server error");
  }
};

const getallpaymentsbyliability = async (req, res, next) => {
  try {
    let data = await Payment.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "liability",
          localField: "liability_id",
          foreignField: "_id",
          as: "liability_id",
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
    return res.status(500).send("Internal server error");
  }
};

module.exports = {
  addpayment,
  getpaymentbyid,
  updatepayment,
  deletepayment,
  getallpaymentsbyliability,
};
