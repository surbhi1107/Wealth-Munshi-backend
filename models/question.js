let mongoose = require("mongoose");
let Schema = mongoose.Schema;

/**
 * Question Schema
 */
var questionSchema = new Schema(
  {
    type: {
      type: String,
      trim: true,
    },
    question: {
      type: String,
      trim: true,
      required: false,
    },
    option_a: {
      type: String,
      trim: true,
      required: false,
    },
    option_b: {
      type: String,
      trim: true,
      required: false,
    },
    option_c: {
      type: String,
      trim: true,
      required: false,
    },
    option_d: {
      type: String,
      trim: true,
      required: false,
    },
    option_e: {
      type: String,
      trim: true,
      required: false,
    },
    answer: {
      type: String,
      trim: true,
      require: false,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("question", questionSchema);
module.exports = Question;
