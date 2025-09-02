import mongoose from 'mongoose';

const userPaymentsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  materialId: { type: String, required: true }, // This could be the ID of the specific material
  type: { type: String, required: true }, // This could be 'ncert-solutions', 'previous-year-questions', etc.
  className: { type: String, required: true },
  subject: { type: String, required: true },
  paymentStatus: { type: Boolean, default: false },
  lastPaymentDate: { type: Date },
});

const UserPayments = mongoose.model('UserPayments', userPaymentsSchema);

export default UserPayments;
