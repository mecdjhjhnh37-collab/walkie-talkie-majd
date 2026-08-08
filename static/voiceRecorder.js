// 🎤 Voice Recorder
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

export async function startVoiceRecording() {

    audioStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    audioChunks = [];

    mediaRecorder =
        new MediaRecorder(audioStream);

    mediaRecorder.addEventListener(
        "dataavailable",
        (event) => {

            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }

        }
    );

    mediaRecorder.start();

    console.log("🎤 بدأ تسجيل الصوت");

    return mediaRecorder;
}


export function stopVoiceRecording() {

    return new Promise((resolve) => {

        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {

            resolve(null);
            return;

        }

        mediaRecorder.addEventListener(
            "stop",
            () => {

                const audioBlob =
                    new Blob(
                        audioChunks,
                        {
                            type: "audio/webm"
                        }
                    );

                audioStream
                    ?.getTracks()
                    .forEach(
                        track => track.stop()
                    );

                console.log("⏹️ انتهى التسجيل");

                resolve(audioBlob);

            },
            { once: true }
        );

        mediaRecorder.stop();

    });
}
