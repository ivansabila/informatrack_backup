function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.admin) {
        return res.redirect("/");
    } else {
        return next();
    }
}

export default redirectIfAuthenticated;
