const { model, Schema } = require('mongoose');

let managerMembers = new Schema({
    Staff: { type: Array, required: true, default: [] },
    ID: { type: Number, required: true }
})

module.exports = model("managerMembers", managerMembers);