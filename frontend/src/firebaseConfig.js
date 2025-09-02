// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth"; // Add onAuthStateChanged import
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDXo1dpqoVD5kiLNPKv69E8O6T1aC1v4Bw",
  authDomain: "sample-firebase-ai-app-d6188.firebaseapp.com",
  projectId: "sample-firebase-ai-app-d6188",
  storageBucket: "sample-firebase-ai-app-d6188.firebasestorage.app",
  messagingSenderId: "256529531120",
  appId: "1:256529531120:web:beaa3b0e2804a58efe0235",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

// Set authentication persistence to local storage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("❌ Persistence error:", error);
    alert("An error occurred while setting authentication persistence.");
  });

// Export Firebase services and onAuthStateChanged
export { auth, db, onAuthStateChanged }; // Export onAuthStateChanged
