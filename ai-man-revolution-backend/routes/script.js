const express = require('express');
const Script = require('../models/Script');
const router = express.Router();

// Create a script
router.post('/', async (req, res) => {
    const newScript = new Script(req.body);
    await newScript.save();
    res.status(201).send(newScript);
});

// Get all scripts
router.get('/', async (req, res) => {
    const scripts = await Script.find();
    res.json(scripts);
});

module.exports = router;
