import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrxgm0VQTfRv0ixXh9uQ81HBJ8SmD8c1E",
  authDomain: "mecd-voice-ap.firebaseapp.com",
  projectId: "mecd-voice-ap",
  storageBucket: "mecd-voice-ap.firebasestorage.app",
  messagingSenderId: "595103941809",
  appId: "1:595103941809:web:08af004c43bc94ec33ce90"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.onload = function () {

    const loginBtn = document.getElementById("loginBtn");

    if (!loginBtn) {
        alert("لم يتم العثور على زر تسجيل الدخول");
        return;
    }

    loginBtn.onclick = async function () {

        try {

            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            alert("مرحباً " + user.displayName);

            window.location.href = "/home";

        } catch (error) {

            alert(error.message);
            console.log(error);

        }

    };

};
