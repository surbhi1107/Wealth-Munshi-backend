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
    if (type && start_time && end_time) {
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
        let newPayment = {
          type: payment_details?.type,
          name: payment_details?.name,
          amount: payment_details?.amount,
          inflation: payment_details?.inflation,
          start_time: payment_details?.start_time,
          end_time: payment_details?.end_time,
          payment_time: payment_details?.payment_time,
          isin_cashflow: payment_details?.isin_cashflow,
          timeline_desc: payment_details?.timeline_desc,
          liability_id: liability?._id,
          user_recommended: payment_details?.user_recommended,
          user_id: req.user._id,
        };
        let donePayment = await Payment.create({
          ...newPayment,
        });
        if (!donePayment?._id) {
          return res.status(400).send({
            success,
            data: { liability },
            error:
              "Liability added but payment not added please try again later.",
          });
        } else {
          let newLiability = await Liability.findByIdAndUpdate(liability?._id, {
            $set: { ...liability, payment_ids: [donePayment?._id] },
          });
          success = true;
          return res.send({
            success,
            data: { liability: newLiability, payments: donePayment },
          });
        }
      } else {
        success = true;
        return res.send({ success, data: { liability } });
      }
    } else {
      return res.status(500).send("All fields are required");
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
      { $and: [{ _id: liabilityId }, { user_id: req.user?._id }] },
      {
        $lookup: {
          from: "familymember",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
    ]);
    if (!liability) {
      return res.status(400).send({ success, error: "Data not found" });
    }
    success = true;
    return res.send({ success, data: liability?.[0] ?? {} });
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
            start_time: payment_details?.start_time,
            end_time: payment_details?.end_time,
            payment_time: payment_details?.payment_time,
            isin_cashflow: payment_details?.isin_cashflow,
            timeline_desc: payment_details?.timeline_desc,
            liability_id: updatedLiability?._id,
            user_recommended: payment_details?.user_recommended,
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
    if (!findLiability) {
      return res.status(400).send({ success, msg: "Data Not Found" });
    }
    let deleted = await Liability.findByIdAndDelete(liabilityId);
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
          from: "familymember",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
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
