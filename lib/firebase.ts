import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-YyhH6YxdWs121F0cooKUJmu0WdTB7sk",
  authDomain: "hertsu-452a6.firebaseapp.com",
  databaseURL: "https://hertsu-452a6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hertsu-452a6",
  storageBucket: "hertsu-452a6.firebasestorage.app",
  messagingSenderId: "540872912805",
  appId: "1:540872912805:web:bc49d0c9e8c30c5c89824c"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);
storage = getStorage(app);

export { app, db, auth, storage };
