
import journalSchema from "../models/journaling.model.js";

// ➤ Create a new journalSchema entry
 const addJournal = async (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    const entry = new journalSchema({ userId, mood, note });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Get all journalSchema entries for a user
 const getJournals = async (req, res) => {
  try {
    
    const { userId } = req.params;
    const entries = await journalSchema.find({ userId }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Get a single journalSchema entry
 const getJournalById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await journalSchema.findById(id);
    if (!entry) return res.status(404).json({ message: "journalSchema not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Update a journalSchema entry
 const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { mood, note } = req.body;
    const updated = await journalSchema.findByIdAndUpdate(
      id,
      { mood, note },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "journalSchema not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Delete a journalSchema entry
 const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await journalSchema.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "journalSchema not found" });
    res.json({ message: "journalSchema deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  addJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
}