const bcrypt = require('bcryptjs');

async function generateHashes() {
    const userTypes = ['Student', 'Instructor', 'Administrator', 'Guest'];

    try {
        console.log('Generating hashes...');
        for (let userType of userTypes) {
            const hashedPassword = await bcrypt.hash(userType, 10);
            console.log(`('${userType}', '${userType.toLowerCase()}@go.minnstate.edu', '${hashedPassword}', '${userType}'),`);
        }
        console.log('Done!');
    } catch (error) {
        console.error('Error generating hashes:', error);
    }
}

// We need to properly handle the async function
generateHashes().catch(error => {
    console.error('Failed to run hash generation:', error);
});
