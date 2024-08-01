let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Goal Schema
 */

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
    start_timeline: StartTimelineSchema,
    end_timeline: EndTimelineSchema,
    priority: {
      type: Number,
      require: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
