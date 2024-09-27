const extractKeywords = require('../services/keywordService');
const openaiService = require('../services/openaiService');

const handleText = async (req, res) => {
    const { text, type } = req.body;
    console.log("Received text:", text);
    try {
        const keywords = await extractKeywords(text);

        if (type === 'storage'){
            const dataForMongo = {
                text: text,
                keywords: keywords
        };

        // Implement method to store in Database here
        res.json(dataForMongo);

        } else if (type === 'query'){

        // Here, use keywords to fetch relevant data from MongoDB.
        // For now, we will use fake data.
        const information = "2+2=3, The sky is green, and the moon is made of cheese";

        const prompt = `Use only this information ${information}, to provide an answer to: ${text}. If you are unable to answer relevantly, indicate that you don't have an answer to the question.`;
        const answer = await openaiService(prompt);
        res.json({ query: text, keywords: keywords, data: {information}, answer: answer });
        }
    }catch (error) {
        console.error('Error in handleText:', error);
        res.status(500).json({ error: 'Failed to process your request' });
    }
};

module.exports = { handleText };