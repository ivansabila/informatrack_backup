const options = document.querySelectorAll(".thesisOption");
const inputThesis = document.querySelector("#chosenThesis");
const submitThesis = document.querySelector("#submitThesis");

options.forEach((div, index) => {
    div.addEventListener("click", () => {
        options.forEach((d) => {
            d.classList.remove("bg-grey");
            d.classList.add("bg-red-400");
        });
        div.classList.remove("bg-red-400");
        div.classList.add("bg-darkBlue");
        inputThesis.value = index;

        submitThesis.removeAttribute("disabled");
    });
});
