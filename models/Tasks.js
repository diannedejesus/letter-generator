const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Tasks', TaskSchema)
