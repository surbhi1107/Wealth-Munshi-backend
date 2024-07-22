let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema(
  {
    fname: {
      type: String,
      trim: true,
      required: false,
    },
    lname: {
      type: String,
      trim: true,
      required: false,
    },
    phone_number: {
      type: String,
      trim: true,
      require: false,
    },
    client_type: {
      type: Number,
      require: false,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: false,
    },
    dob: {
      type: Date,
      require: false,
    },
    currency: {
      type: String,
      trim: true,
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
    password: {
      type: String,
      trim: true,
      require: false,
    },
    role: {
      type: Number,
      require: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserSchema);
module.exports = User;
