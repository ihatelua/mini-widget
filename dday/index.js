let params;
let rootElement;

document.addEventListener("DOMContentLoaded", function () {
  params = getUrlParams();
  rootElement = document.getElementById("dDayCounter");

  initializeDdayCounterApp();
});

const getUrlParams = () => {
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  return urlParams;
};

const initializeDdayCounterApp = () => {
  setAppStyles();
  setContent();
  setDate();
};

const setAppStyles = () => {
  rootElement.style.backgroundColor = `#${params.get("background")}` ?? "";
  rootElement.style.color = `#${params.get("text")}` ?? "";
};

const setContent = () => {
  const content = params.get("content");
  rootElement.querySelector(".content").textContent = content ?? "";
};

const setDate = () => {
  function getDaysDifference(targetDate) {
    let today = new Date();

    const gap = today - targetDate;
    const daysDiff = Math.floor(gap / (1000 * 60 * 60 * 24));

    return daysDiff;
  }

  const date = params.get("date");

  if (!date || date.length !== 8) {
    console.error("Invalid Date: ", date);
    rootElement.querySelector(".date").textContent = "Invalid Date";
    rootElement.querySelector(".counter").textContent = "ERROR";
  }

  const year = parseInt(date.slice(0, 4), 10);
  const month = parseInt(date.slice(4, 6), 10);
  const day = parseInt(date.slice(6), 10);

  rootElement.querySelector(".date").textContent =
    `${year}-${month}-${day}` ?? "";

  let targetDate = new Date(year, month - 1, day);
  const diff = getDaysDifference(targetDate);

  const prefix = diff > 0 ? "D+" : "D";
  const dday = diff === 0 ? "TODAY" : prefix + diff;
  rootElement.querySelector(".counter").textContent = dday;
};
