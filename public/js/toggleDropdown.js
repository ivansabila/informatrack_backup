const dropdownBtn = document.querySelector("#dropdownBtn");
const dropdownMenu = document.querySelector("#dropdownMenu");

function toggleDropdown() {
    dropdownMenu.classList.toggle("hidden");
}

document.addEventListener("click", function (e) {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add("hidden");
    }
});
