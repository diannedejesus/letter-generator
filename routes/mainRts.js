const express = require('express')
const router = express.Router()
const mainController = require('../controllers/mainCntr')


router.get('/', mainController.index)
router.get('/generateLetters', mainController.generateLetters)

module.exports = router