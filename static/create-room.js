import { db } from "./app.js";

import {
    doc,
    runTransaction,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded",()=>{


const popup = document.getElementById("roomPopup");
const openBtn = document.getElementById("createRoomBtn");
const cancelBtn = document.getElementById("cancelRoom");
const createBtn = document.getElementById("createRoomNow");



// فتح النافذة

if(openBtn && popup){

openBtn.onclick=()=>{

popup.style.display="flex";

};

}



// إلغاء

if(cancelBtn && popup){

cancelBtn.onclick=()=>{

popup.style.display="none";

};

}



// إنشاء الغرفة

if(createBtn){


createBtn.onclick=async()=>{


const roomName=document
.getElementById("newRoomName")
.value
.trim();



if(roomName===""){

alert("اكتب اسم الغرفة");
return;

}



// معلومات المستخدم

const userName =
localStorage.getItem("userName") || "مستخدم";


const userPhoto =
localStorage.getItem("userPhoto") || "default.png";


const userUid =
localStorage.getItem("userUid") || "unknown";



try{


const counterRef = doc(db,"counters","rooms");



const roomId = await runTransaction(db,async(transaction)=>{


const counterDoc = await transaction.get(counterRef);


let lastNumber = 0;



if(counterDoc.exists()){

lastNumber = counterDoc.data().lastNumber || 0;

}



lastNumber++;



transaction.set(
counterRef,
{
lastNumber:lastNumber
},
{
merge:true
}
);



return "room-" + String(lastNumber).padStart(6,"0");



});




// حفظ بيانات الغرفة في Firestore

await setDoc(
doc(db,"rooms",roomId),
{

name: roomName,

ownerUid: userUid,

ownerName: userName,

ownerPhoto: userPhoto,

createdAt: new Date(),

members:{}

}
);




// حفظ محلي

localStorage.setItem("roomName",roomName);

localStorage.setItem("roomId",roomId);



// الدخول للغرفة

window.location.href="/room";



}catch(e){

console.error(e);

alert(e.message);

}



};


}



});
