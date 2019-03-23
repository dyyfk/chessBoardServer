const router = require('express').Router();

const authCheck = (req, res, next) => {
	if (!req.user) {
		res.redirect('/auth/login');
	} else {
		next();
	}
}

router.get('/', (req, res) => {
	res.render('dashboard', { user: req.user });
});

module.exports = router;