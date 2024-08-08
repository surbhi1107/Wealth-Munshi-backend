let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Expense Schema
 */

const StartTimelineSchema = new Schema({
  date: Date,
  value: String,
  type: String,
});

const EndTimelineSchema = new Schema({
  date: Date,
  value: String,
  type: String,
});

var expenseSchema = new Schema(
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
    isInflation: {
      type: Boolean,
      require: false,
      default: false,
    },
    timeline: {
      type: String,
      trim: true,
      required: false,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("expense", expenseSchema);
module.exports = Expense;
