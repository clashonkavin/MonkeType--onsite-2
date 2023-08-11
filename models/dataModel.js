const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataschema = new Schema(
  {
    username: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    wpm: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    accuracy: {
      type: mongoose.SchemaTypes.String,
      required: true,
    },
    maxwpm: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: "0",
    },
    maxaccuracy: {
      type: mongoose.SchemaTypes.String,
      required: false,
      default: "0",
    },
  },
  { timestamps: true }
);

const data = mongoose.model("data", dataschema);
module.exports = data;
