const userModel = require("../models/user.model");

exports.checkEmalil = (req, res, next) => {
    userModel.findOne({ email: req.body.email }).then(data => {
        if (data) {
            if(!data.isVerified) {
                req.flash('message', [`Email is not verified yet! Please verify your email first!`, 'warning']);
                return res.redirect('/login');
            } else {
                req.flash('message', [`Email already exists!`, 'warning']);
                return res.redirect('/add/member')
            }
        }

        next()
    }).catch(err => {
        console.log(err);
        next();
    })
}