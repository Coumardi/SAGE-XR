const bcrypt = require('bcryptjs');

async function generateHash(input) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(input, salt);
        console.log('\nInput:', input);
        console.log('Hash:', hash);
        console.log('\nYou can use this hash in the database or for testing.');
        return hash;
    } catch (error) {
        console.error('Error generating hash:', error);
        throw error;
    }
}

// If this file is run directly (not imported as a module)
if (require.main === module) {
    // Get the input from command line arguments
    const input = process.argv[2];
    
    if (!input) {
        console.log('Please provide a string to hash.');
        console.log('Usage: node generateHash.js "your string here"');
        process.exit(1);
    }
    
    generateHash(input).catch(error => {
        console.error('Failed to generate hash:', error);
        process.exit(1);
    });
}

module.exports = { generateHash }; 