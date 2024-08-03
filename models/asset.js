let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Asset Schema
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

var assetSchema = new Schema(
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
    curr_valuation: {
      type: Number,
      require: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "familymember",
    },
    goals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "goal",
      default: [],
    },
    surplus_goals: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "goal",
      default: [],
    },
    isAssest: {
      type: Boolean,
      default: true,
      required: false,
    },
    goal_state: {
      type: String,
      trim: true,
      required: false,
    },
    surplusgoal_state: {
      type: String,
      trim: true,
      required: false,
    },
    resources_access_time: StartTimelineSchema,
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Asset = mongoose.model("asset", assetSchema);
module.exports = Asset;
