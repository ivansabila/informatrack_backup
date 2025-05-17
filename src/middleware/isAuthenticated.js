function isAdminLoggedIn(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    } else {
        return res.redirect("/login");
    }
}

export default isAdminLoggedIn;
