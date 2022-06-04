let profileIcon = document.querySelector(".user-profile");
let userProfileVis = false;

profileIcon.addEventListener("click", function(e) {
    if(userProfileVis) {
        document.querySelector(".profile-container").style.display = "none";
        userProfileVis = false;
    }else {
        document.querySelector(".profile-container").style.display = "block";
        userProfileVis = true;
    }
    
});




let audioTag = document.getElementById("music");
let musicPlaying = false;
let musicPlayerControlBtn = document.querySelector(".music-player-control");
audioTag.ontimeupdate = function(e) {
    //calculating % of music played
    let musicPlayed = Math.floor(100 * music.currentTime / music.duration);

    document.querySelector(".music-file-processing").style.width = musicPlayed + "%";
    
    if(musicPlayed === 100) {
        musicPlaying = false;
        document.querySelector(".music-player-bottom").classList.remove('color-chnaging-animation');
        musicPlayerControlBtn.innerText = "play_circle";
    }
    
}

let musicProcessesParent = document.querySelector(".music-file-processed");
musicProcessesParent.addEventListener("click", function(e) {
    let timestamp = audioTag.duration * (e.offsetX / musicProcessesParent.offsetWidth);
    audioTag.currentTime = timestamp;
});


let volumeContainer = document.querySelector(".volume-conroler");
volumeContainer.addEventListener("click", function(e) {
    let clickedPart = Math.floor(10 * e.offsetX / volumeContainer.offsetWidth);
    audioTag.volume = "0." + clickedPart;
    let volumePerc = Math.floor(100 * e.offsetX / volumeContainer.offsetWidth);
    document.querySelector(".volume-up-down").style.width = volumePerc + "%";
});


let userId = document.getElementById("userid").value;
let sessionId = document.getElementById("sessionid").value;
let currentFileName = document.getElementById("currentFileName").value.split(".")[0];
audioTag.src = "/uploads/" + userId + "/" + sessionId + "/output/" + currentFileName + "/vocals.mp3";
audioTag.volume = 1;

let filePlayBtn = document.querySelectorAll(".file-play-btn");
for(let i = 0; i < filePlayBtn.length; i++) {
    filePlayBtn[i].addEventListener("click", function(e) {
        let fileName = e.currentTarget.classList[1];
        playAudio(fileName);
    });
}





musicPlayerControlBtn.addEventListener("click", function(e) {
    if(musicPlaying) {
        musicPlaying = false;
        e.currentTarget.innerText = "play_circle";
        audioTag.pause();
        document.querySelector(".music-player-bottom").classList.remove('color-chnaging-animation');
    }else {
        musicPlaying = true;
        e.currentTarget.innerText = "pause_circle";
        audioTag.play();
        document.querySelector(".music-player-bottom").classList.add('color-chnaging-animation');
    }
    
})


function playAudio(fileName) {
    let fileSrc = "/uploads/" + userId + "/" + sessionId + "/output/" + currentFileName + "/" + fileName + ".mp3";
    audioTag.src = fileSrc;
    audioTag.play();
    musicPlayerControlBtn.innerText = "pause_circle";
    musicPlaying = true;
    document.querySelector(".music-player-bottom").classList.add('color-chnaging-animation');
    document.querySelector(".music-file-name").innerText = fileName + ".mp3";
}


let allFIleDownloadBtns = document.querySelectorAll(".download-btn > span");
for(let i = 0; i < allFIleDownloadBtns.length; i++) {
    allFIleDownloadBtns[i].addEventListener("click", function(e) {
        let downFile = e.currentTarget.classList[1];
        console.log(downFile);
        downloadFile(downFile);
    });
}

function downloadFile(downFile) {
    let a = document.createElement("a");
    a.href = "/uploads/" + userId + "/" + sessionId + "/output/" + currentFileName  + "/" + downFile + ".mp3";
    a.download = downFile + ".mp3";
    a.click();
    a.remove()
}


var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})