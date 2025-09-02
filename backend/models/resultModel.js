import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  image: { type: String, required: true }, // S3 image URL
}, { timestamps: true });

export default mongoose.model('Result', resultSchema);
