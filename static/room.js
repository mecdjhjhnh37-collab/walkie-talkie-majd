import { db } from "./app.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {


    const roomTitle = document.getElementById("roomName");
    const roomIdText = document.getElementById("roomId");


    const roomName = localStorage.getItem("roomName");
    const roomId = localStorage.getItem("roomId");



    if(roomTitle && roomName){

     roomTitle.textContent = roomName;


    if(roomIdText && roomId){

        roomIdText.textContent = "ID: " + roomId;

    }



    // ======================
    // اللغة داخل الغرفة
    // ======================

    const language =
    localStorage.getItem("language") || "ar";


    const input =
    document.getElementById("messageInput");


    if(input){

        if(language === "tr"){

            input.placeholder = "Mesaj yaz...";

        }else{

            input.placeholder = "اكتب رسالة...";

        }

    }




    // ======================
    // الرسائل
    // ======================


    const messagesBox = document.getElementById("messages");
    const sendBtn = document.getElementById("sendMessage");


    let messagesRef = null;



    if(roomId && messagesBox){


        messagesRef = collection(
            db,
            "rooms",
            roomId,
            "messages"
        );



        const q = query(
            messagesRef,
            orderBy("time")
        );



        onSnapshot(q,(snapshot)=>{


            messagesBox.innerHTML="";



            snapshot.forEach((doc)=>{


                const data = doc.data();



                const messageDiv =
                document.createElement("div");

                messageDiv.className="message";



                messageDiv.innerHTML = `

                <div class="message-head">

                <img 
                src="${data.photo || 'https://i.imgur.com/6VBx3io.png'}"
                class="message-photo">


                <span class="message-user">

                ${data.user || "مستخدم"}

                </span>


                </div>


                <div class="message-text">

                ${data.text || ""}

                </div>

                `;



                messagesBox.appendChild(messageDiv);


            });



        });



    }




    // ======================
    // إرسال رسالة
    // ======================


    if(sendBtn){


        sendBtn.onclick = async()=>{


            const text = input.value.trim();


            if(text === "" || !messagesRef){

                return;

            }



            const userName = 
            localStorage.getItem("userName") ||
            "مستخدم";



            const userPhoto =
            localStorage.getItem("userPhoto") ||
            "default.png";




            await addDoc(
                messagesRef,
                {

                    text:text,

                    user:userName,

                    photo:userPhoto,

                    time:serverTimestamp()

                }
            );



            input.value="";


        };


    }




    // ======================
    // أزرار الاتصال
    // ======================


    const callBtn =
    document.getElementById("callBtn");


    if(callBtn){

        callBtn.onclick=()=>{

            alert("📞 الاتصال قيد التطوير");

        };

    }




    const videoBtn =
    document.getElementById("videoBtn");


    if(videoBtn){

        videoBtn.onclick=()=>{

            alert("📹 الفيديو قيد التطوير");

        };

    }




    const voiceBtn =
    document.getElementById("voiceBtn");


    if(voiceBtn){

        voiceBtn.onclick=()=>{

            alert("🎤 الصوت قيد التطوير");

        };

    }



});
