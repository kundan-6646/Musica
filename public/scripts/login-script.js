let musicPlayer = document.getElementById("music");
let progressContainers = document.querySelectorAll(".music-progress");
let progressedMusics = document.querySelectorAll(".progressed");
let currentlyPlaying = '';
let count = 0;


musicPlayer.ontimeupdate = function(e) {
    //calculating % of music played
    let musicPlayed = Math.floor(100 * music.currentTime / music.duration);

    document.querySelector("." + currentlyPlaying + "-progressed").style.width = musicPlayed + "%";
    
    if(musicPlayed < 90) {
        document.querySelector(".music-time-" + currentlyPlaying).innerText = "00:0" + Math.floor(music.currentTime);
    }else if(musicPlayed === 100) {
        document.querySelector("." + currentlyPlaying).innerText = "play_circle";
        document.querySelector(".music-time-" + currentlyPlaying).innerText = "00:" + Math.floor(music.currentTime);
        count = 0;
        currentlyPlaying = '';
    }
    
}

for(let i = 0; i < progressContainers.length; i++) {
    progressContainers[i].addEventListener("click", function(e) {
         //where we clicked on music progress bar
        if(currentlyPlaying + "-progress" === progressContainers[i].classList[2]) {
            let timestamp = musicPlayer.duration * (e.offsetX / progressContainers[i].offsetWidth);
            musicPlayer.currentTime = timestamp;
        }
        
    });
}


let allPlayBtns = document.querySelectorAll(".example-music > span");
for(let i = 0; i < allPlayBtns.length; i++) {
    allPlayBtns[i].addEventListener("click", function(e) {
        if(e.currentTarget.classList[1] === currentlyPlaying && count == 0) {
            pauseAudio();
            e.currentTarget.innerText = "play_circle";
            count = 1;
        }else if(count === 1 && e.currentTarget.classList[1] === currentlyPlaying) {
            musicPlayer.play();
            count = 0;
            e.currentTarget.innerText = "pause_circle";
        }else {
            e.currentTarget.innerText = "pause_circle";
            let fileName = e.currentTarget.classList[1];
            playAudio(fileName);
            count = 0;
        }
        
    });
}

function playAudio(fileName) {
    musicPlayer.src = "/audio/" + fileName + ".mp3";
    musicPlayer.play();
    if(currentlyPlaying != '') {
        document.querySelector("." + currentlyPlaying).innerText = "play_circle";
    }
    
    currentlyPlaying = fileName;
}

function pauseAudio() {
    musicPlayer.pause();
}