const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema({
  microsoftId: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
    required: false,
  },
  groupName: {
    type: String,
    required: false,
  },
  plannerId: {
    type: String,
    required: false,
  },
  plannerName: {
    type: String,
    required: false,
  },
})

module.exports = mongoose.model('Settings', SettingsSchema)
