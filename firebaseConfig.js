const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyCR2mQk2hOSZP6NcxojG1sr_L_KvNdxhIY",
    authDomain: "chatroom-f7516.firebaseapp.com",
    projectId: "chatroom-f7516",
    storageBucket: "chatroom-f7516.appspot.com",
    messagingSenderId: "120753675998",
    appId: "1:120753675998:web:aaff6e25f93c1e35c3ac4f",
    measurementId: "G-1EMNT8C078",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

exports.app = app;
exports.db = db;
