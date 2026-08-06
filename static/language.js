const translations = {

    ar: {
        friends: "الأصدقاء",
        createRoom: "إنشاء غرفة",
        joinRoom: "دخول إلى غرفة",
        publicRooms: "الغرف العامة",
        settings: "الإعدادات"
    },

    tr: {
        friends: "Arkadaşlar",
        createRoom: "Oda Oluştur",
        joinRoom: "Odaya Katıl",
        publicRooms: "Genel Odalar",
        settings: "Ayarlar"
    }

};



function setLanguage(lang){

    localStorage.setItem("language", lang);

}



function loadLanguage(){

    const lang = localStorage.getItem("language") || "ar";

    const elements = {

        friendsText: "friends",
        createRoomText: "createRoom",
        joinRoomText: "joinRoom",
        publicRoomsText: "publicRooms",
        settingsText: "settings"

    };


    for (let id in elements){

        const element = document.getElementById(id);

        if(element){

            element.textContent =
            translations[lang][elements[id]];

        }

    }

}



document.addEventListener(
    "DOMContentLoaded",
    loadLanguage
);
