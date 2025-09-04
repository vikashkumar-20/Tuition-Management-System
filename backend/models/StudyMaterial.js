import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
  type: { type: String, required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  year: { type: String },
  category: { type: String },
  files: [
    {
      title: { type: String, required: true },
      fileUrl: { type: String },    // optional
      optionalUrl: { type: String } // optional
    }
  ],
}, { timestamps: true });


const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);
export default StudyMaterial;
