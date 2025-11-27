import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDDw_z4VT0-d3BHB7vLhNn7R2NrtXsJbYQ",
  authDomain: "gamer-match-52d1d.firebaseapp.com",
  projectId: "gamer-match-52d1d",
  storageBucket: "gamer-match-52d1d.firebasestorage.app",
  messagingSenderId: "322560085500",
  appId: "1:322560085500:web:87aba914f144d24e36f679",
  measurementId: "G-GTTE6H73YW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth };