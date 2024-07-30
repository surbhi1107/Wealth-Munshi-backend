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
    country_code: {
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
    phone_type: {
      type: Number,
      require: false,
    },
    age_retire: {
      type: Number,
      require: false,
      default: 65,
    },
    life_expectancy: {
      type: Number,
      require: false,
      default: 85,
    },
    trust_name: {
      type: String,
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
    risk_questionaries: {
      obtained_score: {
        type: Number,
        require: false,
      },
      total_score: {
        type: Number,
        require: false,
      },
      result: {
        type: String,
        require: false,
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", UserSchema);
module.exports = User;
