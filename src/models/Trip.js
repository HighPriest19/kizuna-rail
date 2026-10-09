import mongoose, { Schema } from 'mongoose';

const tripSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    startStation: { type: String, required: true, trim: true },
    endStation: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    distance: { type: Number, required: true, min: 0 },
    highlights: { type: [String], default: [] },
    bestSeason: { type: String, required: true, trim: true },
    operatingMonths: {
        type: [{ type: Number, min: 1, max: 12 }],
        default: []
    },
    imageUrl: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
