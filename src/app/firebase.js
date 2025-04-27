// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK26bmWHtafTouNmT9qcgf9HT9dK5BSbE",
  authDomain: "gemini-e13ba.firebaseapp.com",
  databaseURL: "https://gemini-e13ba-default-rtdb.firebaseio.com/",
  projectId: "gemini-e13ba",
  storageBucket: "gemini-e13ba.firebasestorage.app",
  messagingSenderId: "103374021883",
  appId: "1:103374021883:web:79050f421e6d6bbba7bc5e"
};

// --- INICIALIZACIÓN SEGURA (Evita re-inicializar) ---
let app;
if (!getApps().length) {
    console.log("Firebase.js: Inicializando Firebase App...");
    app = initializeApp(firebaseConfig);
    console.log("Firebase.js: Firebase App NUEVA inicializada.");
} else {
    console.log("Firebase.js: Obteniendo Firebase App existente...");
    app = getApp(); // Obtiene la instancia existente
    console.log("Firebase.js: Firebase App existente obtenida.");
}
// --------------------------------------------------

let db;
try {
    console.log("Firebase.js: Obteniendo instancia de Database...");
    db = getDatabase(app); // Usa la app inicializada o existente
    console.log("Firebase.js: Instancia de Database obtenida:", db ? 'OK' : 'FALLÓ');
} catch (error) {
    console.error("Firebase.js: Error al llamar a getDatabase():", error);
    // db seguirá siendo undefined si hay error
}

console.log("Firebase.js: Exportando db:", db ? 'OK' : 'undefined o null');
export { db }; // Exporta la instancia (puede ser undefined si falló getDatabase)
