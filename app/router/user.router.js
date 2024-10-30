const express = require('express');
const userController = require('../controllers/user.controller');
const upload = require('../helper/upload-image.helper');
const auth = require('../middleware/authenticator.middleware');
const emailValrifier = require('../middleware/email-verifier.middleware');

const router = express.Router();

router.get('/', auth.isLoggedin, userController.dashboardPage);
router.get('/login', userController.loginPage);
router.get('/add/member', auth.isLoggedin, userController.addMemberPage);

router.post('/user/create', auth.isLoggedin, emailValrifier.checkEmalil, upload.single('image'), userController.addNewMember);
router.get('/confirmation/:email/:token', userController.confirmEmail);
router.post('/user/login', userController.loginUser);
router.get('/user/logout', userController.logoutUser);




module.exports = router;