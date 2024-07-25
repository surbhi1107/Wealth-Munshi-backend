let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Partner Schema
 */
var partnerSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: false,
    },
    fname: {
      type: String,
      trim: true,
      required: false,
    },
    mname: {
      type: String,
      trim: true,
      required: false,
    },
    lname: {
      type: String,
      trim: true,
      required: false,
    },
    gender: {
      type: Number,
      required: false,
    },
    known_as: {
      type: String,
      trim: true,
      require: false,
    },
    dob: {
      type: Date,
      require: false,
    },
    age_retire: {
      type: Number,
      require: false,
    },
    life_expectancy: {
      type: Number,
      require: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Partner = mongoose.model("partner", partnerSchema);
module.exports = Partner;
