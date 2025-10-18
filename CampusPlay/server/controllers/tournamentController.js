const Tournament = require("../models/Tournament");

exports.create = async (req, res) => {
  // FIX: Added try...catch block
  try {
    const { title, game, date } = req.body;
    if (!title || !game || !date)
      return res.status(400).json({ error: "title, game, date required" });

    const t = await Tournament.create({
      title,
      game,
      date,
      createdBy: req.userId,
      participants: [req.userId], // Creator automatically joins
    });
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.list = async (_req, res) => {
  // FIX: Added try...catch block
  try {
    const list = await Tournament.find()
      .sort({ date: 1 })
      .populate("createdBy", "name");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.join = async (req, res) => {
  // FIX: Added try...catch block
  try {
    const { id } = req.params;
    const t = await Tournament.findById(id);
    if (!t) return res.status(404).json({ error: "Not found" });

    const already = t.participants.some((u) => String(u) === req.userId);
    if (!already) {
      t.participants.push(req.userId);
      await t.save();
    }

    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
