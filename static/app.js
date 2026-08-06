loginBtn.addEventListener("click", async () => {

    alert("وصل للزر");

    try {

        const result = await signInWithPopup(
            auth,
            provider
        );

        alert("تم الدخول");

        window.location.href="/home";

    } catch(error){

        alert(error.code + "\n" + error.message);

    }

});
