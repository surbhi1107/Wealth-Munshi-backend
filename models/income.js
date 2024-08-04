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
    timeline: {
      type: String,
      trim: true,
      require: false,
    },
    growth_rate: {
      type: Number,
      require: false,
    },
    use_for_living_expenses: {
      type: Boolean,
      default: true,
      required: false,
    },
    income_start: StartTimelineSchema,
    income_end: EndTimelineSchema,
    goal_state: {
      type: String,
      trim: true,
      required: false,
    },
    goals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "goal",
      default: [],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Income = mongoose.model("income", incomeSchema);
module.exports = Income;
