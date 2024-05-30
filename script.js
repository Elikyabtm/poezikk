document.addEventListener("DOMContentLoaded", function() {
    // Synchronisation des lectures audio et vidéo
    var audioPlayers = document.querySelectorAll('audio[id^="audioPlayer"]');
    var videoPlayer = document.getElementById('videoPlayer');

    audioPlayers.forEach(audioPlayer => {
        audioPlayer.addEventListener('play', function() {
            videoPlayer.play();
        });

        audioPlayer.addEventListener('pause', function() {
            videoPlayer.pause();
        });

        audioPlayer.addEventListener('ended', function() {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        });
    });

    // Validation de l'email
    function validateEmail() {
        const email = document.querySelector('.input-box input[type="email"]').value;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            alert('Veuillez entrer une adresse e-mail valide.');
            return false;
        }
        return true;
    }

    // Changement de vidéo sur clic
    const ddlaLinks = document.querySelectorAll('.ddla');
    const videoSource = videoPlayer.querySelector('source');

    ddlaLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const newVideoSrc = link.getAttribute('data-video-src');
            videoSource.src = newVideoSrc;
            videoPlayer.load();
        });
    });

    // Téléchargement de la combinaison vidéo/audio
    const downloadButton = document.getElementById('downloadButton');
    
    downloadButton.addEventListener('click', async function() {
        const { createFFmpeg, fetchFile } = FFmpeg;
        const ffmpeg = createFFmpeg({ log: true });

        console.log('Téléchargement démarré...');

        const selectedVideo = document.querySelector('input[name="video"]:checked');
        const selectedAudio = document.querySelector('input[name="audio"]:checked');

        if (selectedVideo && selectedAudio) {
            const videoSrc = selectedVideo.value;
            const audioSrc = selectedAudio.value;

            console.log('Vidéo sélectionnée:', videoSrc);
            console.log('Audio sélectionné:', audioSrc);

            try {
                console.log('Chargement de FFmpeg...');
                await ffmpeg.load();
                console.log('FFmpeg chargé avec succès');

                console.log('Téléchargement des fichiers vidéo et audio...');
                const videoData = await fetchFile(videoSrc);
                const audioData = await fetchFile(audioSrc);
                console.log('Fichiers téléchargés avec succès');

                console.log('Écriture des fichiers dans le système de fichiers de FFmpeg...');
                ffmpeg.FS('writeFile', 'input.mp4', videoData);
                ffmpeg.FS('writeFile', 'input.mp3', audioData);
                console.log('Fichiers écrits avec succès');

                console.log('Exécution de la commande FFmpeg...');
                await ffmpeg.run('-i', 'input.mp4', '-i', 'input.mp3', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4');
                console.log('Commande FFmpeg exécutée avec succès');

                console.log('Lecture du fichier de sortie...');
                const data = ffmpeg.FS('readFile', 'output.mp4');
                const blob = new Blob([data.buffer], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);

                console.log('Création du lien de téléchargement...');
                const a = document.createElement('a');
                a.href = url;
                a.download = 'combined_video.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                console.log('Téléchargement terminé.');
            } catch (error) {
                console.error('Erreur lors du traitement des fichiers:', error);
                alert('Une erreur est survenue lors du traitement des fichiers. Veuillez réessayer.');
            }
        } else {
            alert('Veuillez sélectionner une vidéo et un audio.');
        }
    });
});
