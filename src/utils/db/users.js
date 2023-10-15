import mongoose from 'mongoose'

export default mongoose.model('User', new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    balance: { type: Number, default: 0 },
    cooldowns: {
        daily: { type: Date },
        work: { type: Date },
        command: { type: Date }
    }
}))