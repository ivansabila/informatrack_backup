const input = document.querySelector("#name");

const length = input.value.length;
input.focus();
input.setSelectionRange(length, length);

