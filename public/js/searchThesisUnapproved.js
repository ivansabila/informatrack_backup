const searchInput = document.querySelector("#searchInput");
const dataList = document.querySelector("#dataList");

function fetchData() {
    const query = searchInput.value;

    fetch(`/activity/unapproved/search?keyword=${encodeURIComponent(query)}`)
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
                    <td class="border border-grey py-2 px-3 ">
                        <div class="flex items-center gap-4">
                            <img class="object-cover w-8 h-8 rounded-full border border-grey"
                                src="/images/_test.jpg" alt="">
                            <p class="font-base text-darkBlue">
                                ${item.name}
                            </p>
                        </div>
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.numberID}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        ${item.tanggalPengajuan}
                    </td>
                    <td class="border border-grey py-2 px-3 font-base text-darkBlue">
                        <a class="flex items-center gap-4 cursor-pointer" href="/activity/unapproved/${item.uid}">
                            <p
                                class="text-darkBlue underline underline-offset-4 decoration-darkBlue">
                                Detail</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                viewBox="0 0 24 24" fill="none" stroke="#262861"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-chevron-right-icon lucide-chevron-right">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </a>
                    </td>
                </tr>`;

                dataList.append(tr);
            });
        });
}

searchInput.addEventListener("input", fetchData);
