import { db } from "./firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";

// Save user information to Firestore (WITHOUT storing password)
export const saveUserToFirestore = async ({ uid, name, email }) => {
  try {
    const userRef = doc(db, "users", uid);  // Use `uid` as document ID
    await setDoc(userRef, {
      name: name || "Unknown",  // Ensure valid data
      email: email || "no-email@domain.com",  // Default email if empty
      createdAt: Timestamp.fromDate(new Date()),  // Store precise timestamp
    });
    console.log("✅ User saved to Firestore");
  } catch (error) {
    console.error("❌ Error saving user to Firestore:", error);
  }
};

const retryWriteToFirestore = async (userRef, data, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await setDoc(userRef, data);
      console.log("✅ User saved to Firestore");
      return;
    } catch (error) {
      attempt++;
      if (attempt === retries) {
        console.error("❌ Error saving user after retries:", error);
        return;
      }
      console.log("Retrying Firestore write...");
    }
  }
};