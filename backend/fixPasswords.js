const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',        
    database: 'sage_xr_auth'
});

const users = [
    { username: 'Student',    password: 'student' },
    { username: 'Instructor', password: 'instructor' },
    { username: 'Admin',      password: 'admin' },
    { username: 'Guest',      password: 'guest' }
];

async function fixPasswords() {
    for (const user of users) {
        const hashed = await bcrypt.hash(user.password, 10);
        db.query('UPDATE users SET password = ? WHERE starid = ?',
            [hashed, user.username.toLowerCase()],
            (err) => {
                if (err) console.error(err);
                else console.log(`Fixed: ${user.username}`);
            }
        );
    }
}

fixPasswords();