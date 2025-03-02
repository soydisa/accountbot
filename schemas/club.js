const { model, Schema } = require('mongoose');

let club = new Schema({
    President: { type: String, required: true, unique: true },
    Name: { type: String, required: true, unique: true },
    ClubID: { type: String, required: true, unique: true },
    Members: { type: Array, required: false, default: [] },
    Private: { type: Boolean, required: false, default: false },
    Color: { type: String, required: true, default: 'Red' },
    LastAdvertised: { type: Date, required: true, default: '2011-09-15T06:00:00.000Z' }
})

module.exports = model("club", club);