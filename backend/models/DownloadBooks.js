// models/DownloadBooks.js
import mongoose from 'mongoose';

const downloadBooksSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  downloads: [
    {
      className: { type: String, required: true },
      subject: { type: String, required: true },
      count: { type: Number, default: 0 } // Track the number of downloads
    }
  ]
});

const DownloadBooks = mongoose.model('DownloadBooks', downloadBooksSchema);
export default DownloadBooks;
