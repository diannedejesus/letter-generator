const mongoose = require('mongoose')

const PlannerSchema = new mongoose.Schema({
  plannerId: {
    type: String,
    required: true,
  },
  plannerName: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Planners', PlannerSchema)
