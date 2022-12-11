window.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:7070/status?amount=true")
    .then((data) => data.json())
    .then((res) => console.log(res));
});
