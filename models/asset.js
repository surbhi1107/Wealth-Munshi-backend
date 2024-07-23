let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Asset Schema
 */
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
    start_time: {
      type: Date,
      trim: true,
      require: false,
    },
    isAssest: {
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

const Asset = mongoose.model("asset", assetSchema);
module.exports = Asset;
