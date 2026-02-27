/* ================================================
   Firebase Configuration
   ================================================
   ⚠️  SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project (or use existing)
   3. Click "Add app" → Web (</>)
   4. Copy your config object and paste below
   5. Enable Firestore in the Firebase console
      (Build → Firestore Database → Create database → Start in test mode)
   ================================================ */

const firebaseConfig = {
     apiKey: "AIzaSyBzK7OR6jM9ixjhQnLKORfwWcP9GLqVQrw",
  authDomain: "ssh26-70e1e.firebaseapp.com",
  projectId: "ssh26-70e1e",
  storageBucket: "ssh26-70e1e.firebasestorage.app",
  messagingSenderId: "473817431022",
  appId: "1:473817431022:web:e968ac60c2dd614d31ecff",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore reference
const db = firebase.firestore();
