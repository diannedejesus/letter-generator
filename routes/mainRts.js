const express = require('express')
const router = express.Router()
const mainController = require('../controllers/mainCntr')

router.get('/', mainController.index)
router.get('/err', mainController.error)

router.post('/setPlan', mainController.setPlan)
router.post('/generateLetters', mainController.generateLetters)

router.get('/filterTasks/:label', mainController.filterTasks)


module.exports = router