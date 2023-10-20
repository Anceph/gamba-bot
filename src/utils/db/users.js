import mongoose from 'mongoose'

export default mongoose.model('User', new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    role: { type: Number, default: 0},
    balance: { type: Number, default: 0 },
    totalInventoryValue: { type: Number, default: 0 },
    isPlayingBj: { type: Boolean, default: false},
    cooldowns: {
        daily: { type: Date },
        work: { type: Date },
        command: { type: Date }
    }
}))