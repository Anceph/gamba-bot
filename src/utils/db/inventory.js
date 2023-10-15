import mongoose from 'mongoose'

export default mongoose.model('inventory', new mongoose.Schema({
    user_id: { type: String, unique: true, required: true },
    inventory: [{ skin: String, quantity: Number }]
}))