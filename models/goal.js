let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Goal Schema
 */
var goalSchema = new Schema(
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
      required: false,
    },
    inflation: {
      type: String,
      trim: true,
      require: false,
    },
    is_longterm_goal: {
      type: Boolean,
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
    priority: {
      type: Number,
      require: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    user_recommended: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
    timeline_desc: {
      type: String,
      require: false,
    },
    goal_often: {
      type: String,
      require: false,
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model("goal", goalSchema);
module.exports = Goal;
