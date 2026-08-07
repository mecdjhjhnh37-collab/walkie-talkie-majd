import "./app.js";
import "./user.js";
import "./room.js";



document.addEventListener("DOMContentLoaded",()=>{


const openBtn = document.getElementById("createRoomBtn");

const popup = document.getElementById("roomPopup");

const cancel = document.getElementById("cancelRoom");

const create = document.getElementById("createRoomNow");



if(openBtn){

openBtn.onclick = ()=>{

popup.style.display="flex";

};

}



if(cancel){

cancel.onclick = ()=>{

popup.style.display="none";

};

}




if(create){

create.onclick = ()=>{


let name = document.getElementById("roomName").value;


if(name.trim()==""){

alert("اكتب اسم الغرفة");

return;

}



// إنشاء ID مؤقت

let id =
"room-" +
Math.floor(Math.random()*900000+100000);



localStorage.setItem(
"roomName",
name
);


localStorage.setItem(
"roomId",
id
);



window.location.href="/room";


};



}



});
