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
// controllers/tournaments.js (join)
const Tournament = require('../models/Tournament');

exports.join = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.userId; // set by auth middleware

    if (!tournamentId) return res.status(400).json({ error: 'Tournament id required' });
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    // atomically add user to participants only if not present
    const updated = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).populate('createdBy', 'name').lean();

    if (!updated) return res.status(404).json({ error: 'Tournament not found' });

    return res.json(updated);
  } catch (err) {
    console.error('Join error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
