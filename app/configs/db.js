const mongoose = require('mongoose');

async function dbConnect() {
    mongoose.connect(process.env.MONGODB_URL).then(()=> {
        console.log('Database connected successfully...  :)');
    }).catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}

module.exports = dbConnect;