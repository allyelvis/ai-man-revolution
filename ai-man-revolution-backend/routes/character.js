const express = require('express');
const Character = require('../models/Character');
const router = express.Router();

// Create a character
router.post('/', async (req, res) => {
    const newCharacter = new Character(req.body);
    await newCharacter.save();
    res.status(201).send(newCharacter);
});

// Get all characters
router.get('/', async (req, res) => {
    const characters = await Character.find();
    res.json(characters);
});

module.exports = router;
