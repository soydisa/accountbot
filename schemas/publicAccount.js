const { model, Schema } = require('mongoose');

let publicAccount = new Schema({
    DiscordID: { type: String, required: true, unique: true },
    UserID: { type: String, required: true, unique: true },
    Username: { type: String, required: true, unique: true },
    Image: { type: String, required: true },
    Description: { type: String, required: false, default: "None" },
    Color: { type: String, required: false, default: 'Red' },
    Likes: { type: Number, required: false, default: 0 },
    Liked: { type: Array, required: false, default: [] },
    Club: { type: Array, required: false, default: [] },
    Suspended: { type: Boolean, required: true, default: false },
    DailyLikes: { type: Number, default: 0 },
    WeeklyLikes: { type: Number, default: 0 },
    Missions: [
        {
            type: { type: String },
            start: { type: Date },
            likes: { type: Number },
            prize: { type: Number },
            status: { type: String }
        }
    ]
})

module.exports = model("publicAccount", publicAccount);