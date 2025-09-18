
import express from "express";
import {
  addJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
} from "../controllers/journal.controller.js";

const journalRouter = express.Router();

journalRouter.post("/", addJournal);          // Add entry
journalRouter.get("/:userId", getJournals);   // Get all entries for a user
journalRouter.get("/entry/:id", getJournalById); // Get one entry
journalRouter.put("/:id", updateJournal);     // Update entry
journalRouter.delete("/:id", deleteJournal);  // Delete entry

export default journalRouter;
