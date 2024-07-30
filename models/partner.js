let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Partner Schema
 */
var partnerSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      default: "partner",
    },
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
      require: true,
      default: 65,
    },
    life_expectancy: {
      type: Number,
      require: true,
      default: 85,
    },
    // partner or couple
    is_register_partner: {
      type: Boolean,
      require: false,
      default: false,
    },
    // main partner which is user
    is_main_partner: {
      type: Boolean,
      require: false,
      default: false,
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
