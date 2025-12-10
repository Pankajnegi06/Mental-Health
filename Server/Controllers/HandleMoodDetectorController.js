const { main } = require("../Services/ai.service.js");

const getYourMood = async (req, res) => {
    try {
        const { myCurrMood } = req.body;
        console.log(`Received mood input: ${myCurrMood}`);

        if (!myCurrMood || myCurrMood.trim() === "") {
            return res.json({
                status: 0,
                message: "Mood input is required",
                data: null
            });
        }

        const resultData = await main(myCurrMood.trim());

        if (!resultData) {
            return res.json({
                status: 0,
                message: "Failed to analyze mood",
                data: null
            });
        }

        console.log(`Mood detected: ${resultData} (type: ${typeof resultData})`);

        return res.json({
            status: 1,
            message: "Mood analyzed successfully",
            data: resultData
        });

    } catch (e) {
        console.error("Error in getYourMood controller:", e.message);
        return res.json({
            status: 0,
            message: "Error processing mood analysis",
            data: null,
            error: process.env.NODE_ENV === "development" ? e.message : undefined
        });
    }
};


module.exports = { getYourMood };