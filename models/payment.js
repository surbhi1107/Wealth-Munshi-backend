let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const StartTimelineSchema = new Schema({
  date: Date,
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "familymember",
  },
  value: String,
  type: String,
  desc: String,
});

const EndTimelineSchema = new Schema({
  date: Date,
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "familymember",
  },
  value: String,
  type: String,
  desc: String,
});

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
    timeline: {
      type: String,
      trim: true,
      require: false,
    },
    isin_cashflow: {
      type: Boolean,
      default: false,
      required: false,
    },
    next_payment_start: StartTimelineSchema,
    next_payment_end: EndTimelineSchema,
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    liability_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "liability",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;
