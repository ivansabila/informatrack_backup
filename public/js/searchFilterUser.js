const searchInput = document.querySelector("#searchInput");
const dataList = document.querySelector("#dataList");
const roleFilter = document.querySelectorAll(".roleFilter");

function fetchData() {
    const query = searchInput.value;
    const selectedRoles = Array.from(roleFilter)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

    const params = new URLSearchParams({
        keyword: query,
        roles: selectedRoles.join(","),
    });

    fetch(`/users/search?${params}`)
        .then((res) => res.json())
        .then((data) => {
            dataList.innerHTML = "";

            data.forEach((item, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <td class="border border-grey py-2 px-3 font-base text-darkBlue">${index + 1}</td>
                <td class="border border-grey py-2 px-3 ">
                    <div class="flex items-center gap-4">
                        <img class="object-cover w-8 h-8 rounded-full border border-grey"
                            src="/images/_test.jpg" alt="">
                        <p class="font-base text-darkBlue">${item.name}</p>
                    </div>
                </td>
                <td class="border border-grey py-2 px-3 font-base text-darkBlue">${item.numberID}</td>
                <td class="border border-grey py-2 px-3 font-base text-darkBlue">${item.role}</td>
                <td class="border border-grey py-2 px-3 font-base text-darkBlue">${item.registerDate}</td>
                <td class="border border-grey font-base text-darkBlue">
                    <div class="flex p-1">
                        <a class="flex items-center gap-2 cursor-pointer p-2 h-9 group hover:bg-darkBlue"
                            href="/users/edit/${item.uid}">
                            <svg class="stroke-darkBlue group-hover:stroke-white"
                                xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-pencil-icon lucide-pencil">
                                <path
                                    d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                                <path d="m15 5 4 4" />
                            </svg>
                            <p class="font-base text-darkBlue group-hover:text-white">
                                Edit</p>
                        </a>
                        <button
                            class="flex items-center gap-2 cursor-pointer p-2 h-9 group border-l border-grey hover:bg-red-400"
                            type="button" onclick="rejectUser(${item.uid})">
                            <svg class="stroke-red-400 group-hover:stroke-white"
                                xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-ban-icon lucide-ban">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m4.9 4.9 14.2 14.2" />
                            </svg>
                            <p class="font-base text-red-400 group-hover:text-white">
                                Hapus</p>
                        </button>
                    </div>
                </td>`;

                dataList.append(tr);
            });
        });
}

searchInput.addEventListener("input", fetchData);
roleFilter.forEach((cb) => cb.addEventListener("change", fetchData));
