const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Groups', GroupSchema)
