const userModel = require('../models/user.model');
const tokenModel = require('../models/token.model');
const jsonwebtoken = require('jsonwebtoken');
const { hashPassword, verifyPasswords, tokenGenerator, sendEmailVerificationLink } = require('../helper/auth.helper');
const crypto = require("crypto");

class UserController {
    async addMemberPage(req, res) {
        try {
            res.render('add-member', {
                title: 'Add Member',
                data: {
                    name: req.user.name,
                    role: req.user.role,
                    image: req.user.image,
                },
                messages: req.flash('message'),
            })
        } catch (error) {
            console.log("error: ", error);
            req.flash('message', ['Something went wrong!', 'danger'])
            res.render('/');
        }
    }

    async loginPage(req, res) {
        try {
            res.render('login', {
                title: 'Login',
                messages: req.flash('message'),
            })
        } catch (error) {
            console.log("error: ", error);
            req.flash('message', ['Something went wrong!', 'danger'])
            res.render('/login');
        }
    }

    async dashboardPage(req, res) {
        try {
            const users = await userModel.find();

            res.render('dashboard', {
                title: 'Dashboard',
                data: {
                    name: req.user.name,
                    role: req.user.role,
                    image: req.user.image,
                    totalUser: users.length,
                    varifiedUserNo: users.filter((user) => user.isVerified==true).length,
                    pendingUsersNo: users.filter((user) => user.isVerified==false).length
                },
                messages: req.flash('message'),
            })
        } catch (error) {
            console.log("error: ", error);
            req.flash('message', ['Something went wrong!', 'danger'])
            res.render('/login');
        }
    }



    async addNewMember(req, res) {
        try {
            const token = req.cookies['x-access-token'] || req.headers['x-access-token'];
            const creator = jsonwebtoken.verify(token, process.env.JWT_SECRET);

            if(!(creator.role === 'ADMIN')) {
                req.flash('message', ['Only admins can create users', 'warning']);
                return res.redirect('/add/member');
            }

            const { name, email, role } = req.body;

            const file = req.file;
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
            let imagePath = '../../uploads/no-profile-pic.webp';

            if(file) {
                imagePath = `${baseUrl}/${file.filename}`;
            }

            const tempPassword = req.body.password || crypto.randomBytes(16).toString('hex');
            const hashedPassword = await hashPassword(tempPassword);

            const _user = new userModel({
                image: imagePath,
                name,
                email,
                password: hashedPassword,
                role,
            });

            const user = await _user.save();


            /** Now generate and save the token for mail verification */
            const newMembertoken = await new tokenModel({
                user: user._id,
                token: crypto.randomBytes(16).toString('hex'),
            }).save();

            let verification_mail = `${req.protocol}://${req.headers.host}/confirmation/${user.email}/${newMembertoken.token}`;

            /** Now send the verification mail*/
            let mailOptions = {
                from: 'no-reply@sayantan.com',
                to: user.email,
                subject: 'Account Verification',
                html: `
                    <h1>Hello, ${name}</h1>
                    <p>Please verify your account by clicking the link below:</p>
                    <a href="${verification_mail}" style="color: blue;">${verification_mail}</a>
                    <br/>
                    <p>Your credential is : </p>
                    <p>Username: ${email}</p>
                    <p>Password: ${tempPassword}</p>
                    <p>Thank you!</p>
                `
            };
            await sendEmailVerificationLink(req, res, mailOptions);

            req.flash('massage', ['User registered successfully', 'success']);
            return res.redirect('/login');
        } catch (error) {
            console.error("error registering: ", error);
            req.flash('massage', [error.messages ? error.messages : 'Server Error', 'danger']);
            return res.redirect('/add/member');
        }
    }

    async confirmEmail(req, res) {
        try {
            const _token = req.params.token;
            const _mail = req.params.email;

            const token = await tokenModel.findOne({ token: _token });
            if (!token) {
                req.flash('message', ['Invalid or expired token', 'warning']);
                return res.redirect('/login');
            }

            const user = await userModel.findById(token.user);
            if (!user) {
                req.flash('message', ['User not found', 'warning']);
                return res.redirect('/login');
            }

            if (user.isVerified) {
                req.flash('message', ['Email already verified', 'warning']);
                return res.redirect('/login');
            }

            const verifiedUser = await userModel.findOneAndUpdate(
                { email: _mail },
                { $set: { isVerified: true, isActive: true } },
                { new: true }
            );

            req.flash('message', [`Successfully verified! ${verifiedUser?.name}, You can log in now.`, 'success']);
            res.redirect('/login');
        } catch (error) {
            console.error(error);
            req.flash('message', [error.message, 'danger'])
            res.redirect('/login');
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            const existingUser = await userModel.findOne({ email: email});
            if(!existingUser) {
                req.flash('message', ['User not found!', 'warning']);
                return res.redirect('/login');
            } else {
                if(existingUser.isVerified === false) {
                    req.flash('message', ['User not verified!', 'warning']);
                    return res.redirect('/login');
                }

                const isMatch = await verifyPasswords(password, existingUser.password);
                if(!isMatch) {
                    req.flash('message', ['Incorrect password!', 'warning']);
                    return res.redirect('/login');
                }

                const _data = {
                    id: existingUser.id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    image: existingUser.image
                }

                const token = await tokenGenerator(_data);
                res.cookie('x-access-token', token, { expiresIn: '24h' });

                req.user = _data;

                req.flash('massage', ['Logged in successfully', 'success']);
                return res.redirect('/');
            }
        } catch (error) {
            console.error("error registering: ", error);
            req.flash('massage', [error.messages ? error.messages : 'Server Error', 'danger']);
            return res.redirect('/login');
        }
    }

    async logoutUser(req, res) {
        try {
            req.user = null;
            res.clearCookie('x-access-token');
            req.flash('message', ['Logged out successfully', 'success']);
            return res.redirect('/login');
        } catch (error) {
            req.flash('message', [error.messages ? error.messages : 'Server Error', 'danger']);
            return res.redirect('/');
        }
    }
}

module.exports = new UserController();