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
    start_timeline: StartTimelineSchema,
    end_timeline: EndTimelineSchema,
  },
  { timestamps: true }
);

const Saving = mongoose.model("saving", savingSchema);
module.exports = Saving;
