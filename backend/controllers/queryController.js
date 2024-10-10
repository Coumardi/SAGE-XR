// Controller handles incoming request logic.
// It processes the data sent by the frontend and uses the appropriate service to perform the required operations. (OpenAI API)
// Ensures the request is valid, retrieves appropriate data, and sends a response back to the frontend.

const { openaiService } = require('../services/openaiService');

const query = async (req, res) => {
    const {prompt} = req.body;

    if (!prompt) {
        return res.status(400).json({error: 'Prompt is required'});
    }

    try {
        const result = await openaiService(prompt);
        res.status(200).json({ result });
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        res.status(500).json({error: 'Error processing query'});
    }
};

module.exports = { query };