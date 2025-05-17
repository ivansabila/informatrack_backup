function capitalize(string) {
    return string
        .split(" ")
        .map((word) => {
            if (word.includes(".")) {
                return word
                    .split(".")
                    .map((part) => {
                        return part.charAt(0).toUpperCase() === part.charAt(0) ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                    })
                    .join(".");
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}

export default capitalize;
