const typeBackground = document.getElementById("typeBox");
const startButton = document.getElementById("strt");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const errorDisplay = document.getElementById("error");
const accuracyDisplay = document.getElementById("accuracy");
let accuracy;
let wordsPerMinute;
let letters = [];
let letterCount = 0;
let paragraph;
let startTime, endTime, timerInterval;
let info;

function display(paragraph) {
  for (let i = 0; i < paragraph.length; i++) {
    letters.push([]);
    letters[i] = document.createElement("span");
    letters[i].textContent = paragraph[i];
    letters[i].classList.add("initial");
    typeBackground.appendChild(letters[i]);
  }
}

async function main() {
  const words = await axios.get(
    "https://random-word-api.herokuapp.com/word?number=150"
  );
  paragraph = words.data.join(" ");
  console.log(paragraph);
  display(paragraph);
}

function sendScoreToServer() {
  const serverUrl = "http://localhost:2000/send-data";
  const data = {
    wpm: wordsPerMinute,
    accuracy: accuracy.toFixed(2),
    name: document.getElementById("userName").value.toLowerCase(),
  };
  fetch(serverUrl, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    })
    .then((data) => {
      console.log("Score sent successfully:", data);
    })
    .catch((error) => {
      console.error("Error sending score:", error);
    });
}

function recieveScorefromServer() {
  const serverUrl = "http://localhost:2000/recieve-data";
  const data = {
    name: document.getElementById("userName").value.toLowerCase(),
  };
  fetch(serverUrl, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      info = await response.json();
      console.log(info);
      document.getElementById(
        "maxScore"
      ).innerHTML = `Your -- Max WPM : ${info.maxwpm} / Max Accuracy ${info.maxaccuracy} `;
    })
    .then((data) => {
      console.log("Score recieved successfully:", data);
    })
    .catch((error) => {
      console.error("Error sending score:", error);
    });
}

function endTest() {
  clearInterval(timerInterval);
  document.removeEventListener("keydown", handleKeyfunction);
  sendScoreToServer();
}

function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    updateTimer();
    updateLiveScore();
  }, 500);
}

function updateTimer() {
  const currentTime = new Date();
  const timeElapsed = 60 - (currentTime - startTime) / 1000;
  if (timeElapsed < 0) {
    endTest();
    return;
  }
  timerDisplay.textContent = `Time : ${timeElapsed.toFixed(0)} seconds`;
}

function updateLiveScore() {
  const currentTime = new Date();
  const timeElapsed = (currentTime - startTime) / 1000;
  const wordsTyped = letterCount / 5;
  wordsPerMinute = Math.floor((wordsTyped / timeElapsed) * 60);
  scoreDisplay.textContent = `CurrentSpeed: ${wordsPerMinute} WPM`;
  const errorLen = document.getElementsByClassName("incorrect").length;
  errorDisplay.textContent = `Error: ${errorLen} letter`;
  accuracy = letterCount == 0 ? 100 : (1 - errorLen / letterCount) * 100;

  accuracyDisplay.textContent = `Accuracy : ${accuracy.toFixed(2)}%`;
}

function handleKeyfunction(e) {
  const validKeys = /^[a-zA-Z\s]$/.test(e.key) || e.key === "Backspace";
  if (validKeys) {
    if (!startTime) {
      startTimer();
      // return;
    }
    if (e.key == "Backspace") {
      if (letterCount > 1) {
        letters[letterCount - 2].classList.add("active");
      }
      if (letterCount > 0) {
        letters[letterCount - 1].classList.remove("correct");
        letters[letterCount - 1].classList.remove("incorrect");
        letters[letterCount - 1].classList.remove("active");
        letterCount--;
      }
    } else if (paragraph[letterCount] == e.key) {
      letters[letterCount].classList.add("correct");
      if (letterCount - 1 > -1) {
        letters[letterCount - 1].classList.remove("active");
      }
      letters[letterCount].classList.add("active");
      letterCount++;
    } else {
      letters[letterCount].classList.add("active");
      if (letterCount - 1 > -1) {
        letters[letterCount - 1].classList.remove("active");
      }
      letters[letterCount].classList.add("incorrect");
      letterCount++;
    }
  }
}

async function startTest() {
  document.addEventListener("keydown", handleKeyfunction);
  recieveScorefromServer();
  startButton.disabled = false;
}

window.onload = () => {
  main();
};
