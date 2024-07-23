let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Income Schema
 */
var incomeSchema = new Schema(
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
    income_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
    amount: {
      type: Number,
      require: false,
    },
    income_duration: {
      type: String,
      trim: true,
      require: false,
    },
    growth_rate: {
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
    use_for_living_expenses: {
      type: Boolean,
      default: true,
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
    user_recommended: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
  },
  { timestamps: true }
);

const Income = mongoose.model("income", incomeSchema);
module.exports = Income;
