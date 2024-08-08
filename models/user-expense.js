let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * user expense Schema
 */

var userExpenseSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    living_expense_type: {
      type: String,
      trim: true,
      require: false,
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
      required: false,
    },
    start_date: {
      type: Date,
      required: false,
    },
    end_date: {
      type: Date,
      required: false,
    },
    fixed_expenses: { type: Array, default: [] },
    discretionary_expenses: { type: Array, default: [] },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const UserExpense = mongoose.model("user-expense", userExpenseSchema);
module.exports = UserExpense;
