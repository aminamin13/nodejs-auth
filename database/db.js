const mongoose = require('mongoose');

const connectToDB = async ()=>{
    try {
    await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to the database successfully');       
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

module.exports = connectToDB;