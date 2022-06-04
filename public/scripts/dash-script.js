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





let fileInput = document.getElementById("mp3-file");
let userInput = document.getElementById("uplod-button");
let splitButton = document.querySelector(".split-btn");

userInput.addEventListener("click", function(e) {
    fileInput.click();
});

fileInput.onchange = ({target}) => {
    let file = target.files[0];

    console.log(file.size);

    if(file) {
        let fileExt = file.name.split(".")[1];
        if(fileExt !== "mp3") {
            alert("Only mp3 files are allowed");
            userInput.innerHTML = '<span class="material-icons">file_upload</span> Upload Audio';
            splitButton.classList.add("disabled");
        }else {
            uploadFile(file.name);
        }
    }
}

function uploadFile(fileName) {
    if(fileName.length >= 23) {
        fileName = fileName.substring(0,20) + "...";
    }
    userInput.innerText = fileName;
    splitButton.classList.remove("disabled");
}

splitButton.addEventListener("click", function(e) {
    document.querySelector(".loader-animation").style.display = "block";
});


var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})