let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Liability Schema
 */
var liabilitySchema = new Schema(
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
    curr_amount: {
      type: Number,
      require: false,
    },
    interest: {
      type: Number,
      require: false,
    },
    total_amount: {
      type: Number,
      require: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
    payment_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "payment",
      default: [],
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Liability = mongoose.model("liability", liabilitySchema);
module.exports = Liability;
