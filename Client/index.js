const courseName = document.getElementById("name");
const startAt = document.getElementById("startAt");
const endOn = document.getElementById("endOn");
const totalViewCount = document.getElementById("totalView");
const outlinePlan = document.getElementById("outline");
const enrolledAmount = document.getElementById("enrolled");
const coursePrice = document.getElementById("price");
// const totalAmount = document.getElementById("amount");
const copyright = document.getElementById("copyright");
const sectionLoad = document.getElementById("sectionLoad");
const section = document.getElementById("section");

let course = null;
let error = null;
let loading = true;
const URL = "https://heroapi.msls.one";

function updateContent(content) {
  section.classList.remove("hidden");
  section.classList.add("block");
  const {
    name,
    startedAt,
    endsOn,
    outline,
    enrolled,
    price,
    totalView,
    symbol,
  } = content;
  courseName.innerHTML = name;

  startAt.innerHTML = `<i class="fad fa-calendar-alt pr-1 text-gray-600"></i> ${moment(
    startedAt
  ).format("MMMM Do, YYYY h:mm A")}`;

  endOn.innerHTML = `<i class="fad fa-clock pr-1 text-gray-600"></i> ${moment(
    endsOn
  ).format("MMMM Do, YYYY h:mm A")}`;

  totalViewCount.innerHTML = `<i class="fad fa-glasses pr-1 text-gray-600"></i> <strong>${totalView}</strong> total view`;

  outlinePlan.innerHTML = "";
  outline.forEach((data, index) => {
    let li = document.createElement("li");
    li.classList.add("text-xs");
    li.classList.add("my-2");
    li.classList.add("font-bangla");
    li.innerHTML = `${index + 1}. ${data}`;
    outlinePlan.appendChild(li);
  });

  enrolledAmount.innerHTML = enrolled;
  coursePrice.innerHTML = price + symbol;
  // totalAmount.innerHTML = amount + symbol;
}

async function getCourse() {
  fetch(URL + "/status?amount=true")
    .then((data) => data.json())
    .then((res) => {
      loading = null;
      error = null;
      sectionLoad.classList.remove("block");
      sectionLoad.classList.add("hidden");
      updateContent(res);
      course = res;
    })
    .catch((error) => {
      loading = null;
      course = null;
      section.classList.remove("block");
      section.classList.add("hidden");
      sectionLoad.classList.remove("hidden");
      sectionLoad.classList.add("block");
      error = error;
      if (error) {
        sectionLoad.innerHTML = `<div class="font-text text-sm text-center my-5">We're having trouble accessing the server.</div>`;
      }
    });
}

async function updateViews() {
  if (sessionStorage.getItem("updateViews")) return;
  fetch(URL + "/updateViews")
    .then((res) => res.json())
    .then((data) => {
      sessionStorage.setItem("updateViews", JSON.stringify(data));
    })
    .catch((err) => {
      sessionStorage.removeItem("updateViews");
    });
}

window.addEventListener("DOMContentLoaded", () => {
  copyright.innerText = `Copyright © Programming Hero ${new Date().getFullYear()}`;
  if (loading) {
    sectionLoad.innerHTML = `<div class="rounded-md p-4 w-full mx-auto">
    <div class="animate-pulse flex space-x-4">
      <div class="flex-1 space-y-6 py-1">
        <div class="h-2 bg-slate-400 rounded"></div>
        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-4 pb-3">
            <div class="h-2 bg-slate-400 rounded col-span-2"></div>
            <div class="h-2 bg-slate-400 rounded col-span-1"></div>
          </div>
          <div class="h-2 bg-slate-400 rounded"></div>
          <div class="grid grid-cols-3 gap-4 pt-3 pb-3">
            <div class="h-2 bg-slate-400 rounded col-span-1"></div>
            <div class="h-2 bg-slate-400 rounded col-span-2"></div>
          </div>
          <div class="h-2 bg-slate-400 rounded"></div>
        </div>
      </div>
    </div>
  </div>`;
  }
  getCourse();
  updateViews();
});

setInterval(() => {
  getCourse();
}, 60000);
