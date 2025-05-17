const searchInput = document.querySelector("#searchInput");

function fetchData() {
    const query = searchInput.value;

    fetch(`/users/unapproved/search?keyword=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
            dataList.innerHTML = "";

            data.forEach((item, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                <tr>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${index + 1}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.name}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.numberID}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.email}

                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.role}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.registerDate}
                    </td>
                    <td class="border border-grey font-base text-darkBlue">
                        <div class="flex p-1">
                            <button
                                class="flex items-center gap-2 cursor-pointer p-2 h-9 group hover:bg-red-400"
                                type="button" onclick="rejectUser('${item.uid}')">
                                <svg class="stroke-red-400 group-hover:stroke-white"
                                    xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-ban-icon lucide-ban">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m4.9 4.9 14.2 14.2" />
                                </svg>
                                <p class="font-base text-red-400 group-hover:text-white">
                                    Tolak</p>
                            </button>
                            <button
                                class="flex items-center gap-2 cursor-pointer p-2 h-9 group border-l border-grey hover:bg-darkBlue"
                                type="button" onclick="acceptUser('${item.uid}')">
                                <svg class="stroke-darkBlue group-hover:stroke-white"
                                    xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-check-icon lucide-check">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                                <p class="font-base text-darkBlue group-hover:text-white">
                                    Terima</p>
                            </button>
                        </div>
                    </td>
                </tr>`;

                dataList.append(tr);
            });
        });
}

searchInput.addEventListener("input", fetchData);
