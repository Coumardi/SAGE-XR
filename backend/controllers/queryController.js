const { openaiService } = require('../services/openaiService');

const query = async (req, res) => {
    const {prompt} = req.body;

    if (!prompt) {
        return res.status(400).json({error: 'Prompt is required'});
    }

    try {
        const result = await openaiService(prompt);
        res.json({ result });
    } catch (error) {
        res.status(500).json({error: 'Error processing query'});
    }
};

module.exports = { query };