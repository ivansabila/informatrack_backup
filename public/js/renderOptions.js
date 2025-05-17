const selects = document.querySelectorAll("select[data-role]");

const data = window.data;

const dosenList = data.map((name, index) => ({ id: index.toString(), name }));

function renderOptions() {
    const selectedValues = Array.from(selects)
        .map((select) => select.value)
        .filter((val) => val !== "");

    selects.forEach((select) => {
        const currentValue = select.value;
        select.innerHTML = `<option value="">-- Pilih ${select.dataset.role} --</option>`;
        dosenList.forEach((dosen) => {
            if (!selectedValues.includes(dosen.id) || dosen.id === currentValue) {
                const opt = document.createElement("option");
                opt.value = dosen.id;
                opt.textContent = dosen.name;
                if (dosen.id === currentValue) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

selects.forEach((select) => {
    select.addEventListener("change", renderOptions);
});

renderOptions();
