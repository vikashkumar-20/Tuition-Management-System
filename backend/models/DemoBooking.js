// models/DemoBooking.js
import mongoose from 'mongoose';

const demoBookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  motherName: { type: String, required: true },
  class: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

const DemoBooking = mongoose.model("DemoBooking", demoBookingSchema);

export default DemoBooking;
