const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    backstory: { type: String, required: true },
});

module.exports = mongoose.model('Character', characterSchema);
