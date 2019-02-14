const router = require('express').Router();

const authCheck = (req,res,next)=>{
	if(!req.user){
		res.redirect('/auth/login');
	}else{
		next();
	}
}

router.get('/',(req,res)=>{
	res.redirect('/');
});

module.exports = router;