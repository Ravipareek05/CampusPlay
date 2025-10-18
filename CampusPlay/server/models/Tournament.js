const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tournamentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // This creates a reference to the User model
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // An array of users who have joined
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Tournament", tournamentSchema);
