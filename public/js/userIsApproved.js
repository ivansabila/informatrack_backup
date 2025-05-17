function rejectUser(uid) {
    fetch(`/users/unapproved/reject/${uid}`, { method: "POST" })
        .then((res) => res.json())
        .then(() => {
            location.reload();
        });
}

function acceptUser(uid) {
    fetch(`/users/unapproved/accept/${uid}`, { method: "POST" })
        .then((res) => res.json())
        .then(() => {
            location.reload();
        });
}
