const searchInput = document.querySelector("#searchInput");
const dropdownData = document.querySelector("#dropdownData");

function fetchData() {
    dropdownData.classList.remove("hidden");
    const query = searchInput.value;

    fetch(`/schedule/add/search?keyword=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
            dropdownData.innerHTML = "";

            data.forEach((item, index) => {
                const a = document.createElement("a");
                a.innerHTML = `
                <a class="font-base text-darkBlue px-4 h-10 flex items-center hover:bg-darkBlue hover:text-white"
                    href="/schedule/add/${item.uid}">${item.name} (${item.numberID})
                </a>`;

                dropdownData.append(a);
            });
        });
}

searchInput.addEventListener("input", fetchData);
