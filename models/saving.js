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
 * Saving Schema
 */
var savingSchema = new Schema(
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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    asset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "asset",
    },
    saving_start: StartTimelineSchema,
    saving_end: EndTimelineSchema,
  },
  { timestamps: true }
);

const Saving = mongoose.model("saving", savingSchema);
module.exports = Saving;
