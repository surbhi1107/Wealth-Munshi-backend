let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Familymember Schema
 */
var familymemberSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
      required: true,
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
      type: String,
      trim: true,
      require: false,
    },
    life_expectancy: {
      type: String,
      trim: true,
      require: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Familymember = mongoose.model("familymember", familymemberSchema);
module.exports = Familymember;
