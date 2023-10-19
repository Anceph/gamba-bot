import mongoose from 'mongoose'

export default mongoose.model('guilds', new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    games: [{ jackpot: [{ status: String }] }]
}))