const JournalSchema = require("../Models/JournalSchema");

// Valid mood values from the schema
const VALID_MOODS = ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'angry', 'tired'];

const addJournal = async (req, res) => {
    const { mood, moodDescription, description, intensity, userId, 
            sleepQuality, sleepHours, stressLevel, energyLevel, activities, gratitude } = req.body;
    
    const finalDescription = moodDescription || description;

    if (!mood || !finalDescription || !userId) {
        return res.status(400).json({
            status: 0,
            message: "Missing required fields: mood, description (or moodDescription), userId"
        });
    }

    // Validate mood
    if (!VALID_MOODS.includes(mood)) {
        return res.status(400).json({
            status: 0,
            message: `Invalid mood. Valid moods: ${VALID_MOODS.join(", ")}`
        });
    }

    // Validate intensity
    const intensityNum = Number(intensity) || 5;
    if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 10) {
        return res.status(400).json({
            status: 0,
            message: "Intensity must be between 1 and 10"
        });
    }

    try {
        console.log('addJournal called with:', { mood, userId, intensity: intensityNum });
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Check if entry exists for today
        let journalEntry = await JournalSchema.findOne({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        console.log('Existing entry found:', !!journalEntry);

        if (journalEntry) {
            // Update existing entry
            journalEntry.moodEntries.push({
                mood,
                intensity: intensityNum,
                notes: finalDescription
            });
            
            // Update enhanced data fields
            if (sleepQuality !== undefined || sleepHours !== undefined) {
                journalEntry.sleep = {
                    quality: sleepQuality || 3,
                    duration: sleepHours || 7,
                    date: new Date()
                };
            }
            
            if (stressLevel !== undefined) {
                journalEntry.stressLevel = stressLevel;
            }
            
            if (energyLevel !== undefined) {
                journalEntry.energyLevel = energyLevel;
            }
            
            if (activities && Array.isArray(activities) && activities.length > 0) {
                // Save to activities field with proper structure
                journalEntry.activities = activities.map(a => ({
                    type: a.type || 'other',
                    duration: a.duration || 0,
                    moodBefore: a.moodBefore || 5,
                    moodAfter: a.moodAfter || 5,
                    description: a.description || '',
                    timestamp: new Date()
                }));
            }
            
            if (gratitude && Array.isArray(gratitude) && gratitude.length > 0) {
                journalEntry.gratitude = gratitude;
            }
            
            await journalEntry.save();
            
            return res.status(200).json({
                status: 1,
                message: "Journal entry updated successfully",
                journalId: journalEntry._id
            });
        } else {
            // Create new entry
            const newEntry = new JournalSchema({
                user: userId,
                date: new Date(),
                content: finalDescription,
                moodEntries: [
                    {
                        mood,
                        intensity: intensityNum,
                        notes: finalDescription
                    }
                ],
                sleep: (sleepQuality !== undefined || sleepHours !== undefined) ? {
                    quality: sleepQuality || 3,
                    duration: sleepHours || 7,
                    date: new Date()
                } : undefined,
                stressLevel: stressLevel,
                energyLevel: energyLevel,
                activities: activities && Array.isArray(activities) ? activities.map(a => ({
                    type: a.type || 'other',
                    duration: a.duration || 0,
                    moodBefore: a.moodBefore || 5,
                    moodAfter: a.moodAfter || 5,
                    description: a.description || '',
                    timestamp: new Date()
                })) : [],
                selfCare: [], // Keep empty for now, activities is the main field
                gratitude: gratitude && Array.isArray(gratitude) ? gratitude : []
            });

            await newEntry.save();

            return res.status(201).json({
                status: 1,
                message: "Journal entry added successfully",
                journalId: newEntry._id
            });
        }

    } catch (error) {
        console.error("Error adding journal:", error);
        return res.status(500).json({
            status: 0,
            message: `Error adding journal: ${error.message}`
        });
    }
};

const getJournals = async (req, res) => {
    // Get userId from query parameters
    const userId = req.query.userId;

    console.log('getJournals called with userId:', userId);

    if (!userId) {
        return res.status(400).json({
            status: 0,
            message: "User ID is required"
        });
    }

    try {
        const journals = await JournalSchema.find({ user: userId })
            .sort({ date: -1 }) // Newest first
            .select('-__v') // Exclude version key
            .lean(); // Convert to plain JavaScript objects

        console.log('Found journals:', journals.length);

        return res.json({
            status: 1,
            count: journals.length,
            journals: journals.map(journal => ({
                id: journal._id,
                date: journal.date,
                entries: (journal.moodEntries || []).map(entry => ({
                    id: entry._id,
                    mood: entry.mood,
                    intensity: entry.intensity,
                    description: entry.notes,
                    timestamp: entry.timestamp
                })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort entries by time desc
            }))
        });
    } catch (error) {
        console.error("Error fetching journals:", error);
        return res.status(500).json({
            status: 0,
            message: `Error fetching journals: ${error.message}`
        });
    }
};

// Get a single journal entry by ID
const getJournalById = async (req, res) => {
    try {
        const journal = await JournalSchema.findOne({
            _id: req.params.id,
            author: req.body.userId
        });

        if (!journal) {
            return res.status(404).json({
                status: 0,
                message: "Journal entry not found"
            });
        }

        return res.json({
            status: 1,
            journal: {
                id: journal._id,
                mood: journal.mood,
                intensity: journal.intensity,
                description: journal.notes,
                date: journal.date,
                createdAt: journal.createdAt
            }
        });
    } catch (error) {
        console.error("Error fetching journal:", error);
        return res.status(500).json({
            status: 0,
            message: `Error fetching journal: ${error.message}`
        });
    }
};

// Update a journal entry
const updateJournal = async (req, res) => {
    const { mood, moodDescription, intensity } = req.body;
    const { id } = req.params;
    const userId = req.body.userId;

    try {
        const updates = {};
        if (mood) {
            if (!VALID_MOODS.includes(mood)) {
                return res.status(400).json({
                    status: 0,
                    message: `Invalid mood. Must be one of: ${VALID_MOODS.join(', ')}`
                });
            }
            updates.mood = mood;
        }

        if (moodDescription) {
            updates.notes = moodDescription;
        }

        if (intensity) {
            const intensityNum = Number(intensity);
            if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 10) {
                return res.status(400).json({
                    status: 0,
                    message: "Intensity must be a number between 1 and 10"
                });
            }
            updates.intensity = intensityNum;
        }

        const updatedJournal = await JournalSchema.findOneAndUpdate(
            { _id: id, author: userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedJournal) {
            return res.status(404).json({
                status: 0,
                message: "Journal entry not found or you don't have permission to update it"
            });
        }

        return res.json({
            status: 1,
            message: "Journal updated successfully",
            journal: {
                id: updatedJournal._id,
                mood: updatedJournal.mood,
                intensity: updatedJournal.intensity,
                description: updatedJournal.notes,
                date: updatedJournal.date
            }
        });
    } catch (error) {
        console.error("Error adding journal:", error);
        return res.status(500).json({
            status: 0,
            message: `Error adding journal: ${error.message}`
        });
    }
};

// Delete a journal entry
const deleteJournal = async (req, res) => {
    try {
        const deletedJournal = await JournalSchema.findOneAndDelete({
            _id: req.params.id,
            author: req.body.userId
        });

        if (!deletedJournal) {
            return res.status(404).json({
                status: 0,
                message: "Journal entry not found or you don't have permission to delete it"
            });
        }

        return res.json({
            status: 1,
            message: "Journal entry deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting journal:", error);
        return res.status(500).json({
            status: 0,
            message: `Error deleting journal: ${error.message}`
        });
    }
};

module.exports = {
    addJournal,
    getJournals,
    getJournalById,
    updateJournal,
    deleteJournal
};