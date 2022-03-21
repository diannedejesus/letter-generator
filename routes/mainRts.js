const express = require('express')
const router = express.Router()
const mainController = require('../controllers/mainCntr')


router.get('/', mainController.index)

module.exports = router