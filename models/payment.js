let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var paymentSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      required: false,
    },
    amount: {
      type: Number,
      require: false,
    },
    inflation: {
      type: Number,
      require: false,
    },
    start_time: {
      type: Date,
      trim: true,
      require: false,
    },
    end_time: {
      type: Date,
      trim: true,
      require: false,
    },
    payment_time: {
      type: Date,
      trim: true,
      require: false,
    },
    isin_cashflow: {
      type: Boolean,
      default: false,
      required: false,
    },
    timeline_desc: {
      type: String,
      trim: true,
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    liability_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "liability",
    },
    user_recommended: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
