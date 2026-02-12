// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, 
    query, orderBy, onSnapshot, serverTimestamp, limit, addDoc, getDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyBkKXKmrV-vzq3OoUrvihd4X9KGKpjoNBc", 
    authDomain: "calender-98a9e.firebaseapp.com", 
    projectId: "calender-98a9e" 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 他のファイルで使う関数をまとめてエクスポート
export { 
    collection, getDocs, doc, setDoc, deleteDoc, updateDoc, 
    query, orderBy, onSnapshot, serverTimestamp, limit, addDoc, getDoc, arrayUnion 
};
