import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// =====================================
// 🔥 Firebase Configuration
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyBrxgm0VQTfRv0ixXh9uQ81HBJ8SmD8c1E",
    authDomain: "mecd-voice-ap.firebaseapp.com",
    projectId: "mecd-voice-ap",
    storageBucket: "mecd-voice-ap.firebasestorage.app",
    messagingSenderId: "595103941809",
    appId: "1:595103941809:web:e50577f156bcea3633ce90",
    databaseURL: "https://mecd-voice-ap-default-rtdb.firebaseio.com"
};


// =====================================
// 🔥 تشغيل Firebase
// =====================================

export const app =
    initializeApp(firebaseConfig);


// =====================================
// 🗄️ Firestore
// =====================================

export const db =
    getFirestore(app);


// =====================================
// 📦 Firebase Storage
// =====================================

export const storage =
    getStorage(app);


// =====================================
// 🔐 Firebase Authentication
// =====================================

const auth =
    getAuth(app);


// =====================================
// 🔵 Google Provider
// =====================================

const provider =
    new GoogleAuthProvider();


// =====================================
// 🔄 عند تحميل الصفحة
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginBtn =
            document.getElementById("loginBtn");


        if (!loginBtn) {

            return;

        }


        // =================================
        // 🔐 تسجيل الدخول بجوجل
        // =================================

        loginBtn.addEventListener(
            "click",
            async () => {

                try {

                    const result =
                        await signInWithPopup(
                            auth,
                            provider
                        );


                    // =============================
                    // 👤 بيانات المستخدم
                    // =============================

                    const user =
                        result.user;


                    // =============================
                    // 🆔 UID
                    // =============================

                    localStorage.setItem(
                        "userUid",
                        user.uid
                    );


                    // =============================
                    // 👤 الاسم
                    // =============================

                    localStorage.setItem(
                        "userName",
                        user.displayName ||
                        "مستخدم"
                    );


                    // =============================
                    // 🖼️ الصورة
                    // =============================

                    localStorage.setItem(
                        "userPhoto",
                        user.photoURL ||
                        "default.png"
                    );


                    // =============================
                    // 🏠 الانتقال للرئيسية
                    // =============================

                    window.location.href =
                        "/home";


                } catch (error) {

                    console.error(
                        "❌ Login error:",
                        error
                    );


                    alert(
                        "حدث خطأ أثناء تسجيل الدخول:\n\n" +
                        (error.message ||
                            error)
                    );

                }

            }
        );

    }
);
