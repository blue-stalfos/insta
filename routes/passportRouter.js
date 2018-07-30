const express        	= require("express");
const router         	= express.Router();
const User           	= require("../models/user");
const bcrypt         	= require("bcrypt");
const bcryptSalt     	= 10;
const ensureLogin 		= require("connect-ensure-login");
const passport      	= require("passport");
const Photo 			= require('../models/photo');
const uploadCloud 		= require('../config/cloudinary');


router.get("/private", ensureLogin.ensureLoggedIn(), (req, res) => {
	Photo.find({owner:req.user._id})
	.then((photos) => {
		let photoCount = photos.length;
		res.render("passport/private", {user: req.user, photos: photos, numberOfPhotos: photoCount});
	})
});

router.get("/signup", (req, res, next) => {
	res.render("passport/signup");
 });

router.post("/signup", (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const fullname = req.body.fullname;
	const bio 	   = req.body.bio;

	if (username === "" || password === "") {
		res.render("passport/signup", { message: "Please indicate username and password" });
		return;
	}

	User.findOne({ username:username }, "username", (err, user) => {
		if (user !== null) {
			res.render("passport/signup", { message: "Sorry, that username already exists" });
			return;
		}

		const salt = bcrypt.genSaltSync(bcryptSalt);
		const hashPass = bcrypt.hashSync(password, salt);

		const newUser = new User({
			username: username,
			password: hashPass,
			fullname: fullname,
			bio: bio,
			avatar: "/images/generic.jpeg"
		});

		newUser.save((err) => {
			if (err) {
				res.render("passport/signup", { message: "Something went wrong" });
			} else {
				res.redirect("/login");
			}
		});
	});
});

router.get("/login", (req, res, next) => {
	res.render("passport/login", { "message": req.flash("error")});
})

router.post("/login", passport.authenticate("local", {
	successRedirect: "/private",
	failureRedirect: "/login",
	failureFlash: true,
	passReqToCallback: true
}));

router.get("/updateprofile/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
	res.render("passport/updateprofile", {user: req.user});
})

router.post("/updateprofile/:id", (req, res, next) => {
	const username = req.body.username;
	const fullname = req.body.fullname;
	const bio	  = req.body.bio;

	User.findByIdAndUpdate(req.params.id, {
		username: username,
		fullname: fullname,
		bio: bio
	})
  	.then(res.redirect("/private"))
  	.catch();
})

router.get("/uploadavatar", ensureLogin.ensureLoggedIn(), (req, res) => {
	res.render("passport/uploadavatar", {user: req.user});
})

router.post("/uploadavatar/:id", uploadCloud.single("photo"), (req, res, next) => {
	const imgPath = req.file.url;
	const owner = req.params.id;
	const avatar = true;
	const newPhoto = new Photo({imgPath, owner, avatar})

	newPhoto.save()

	User.findByIdAndUpdate(req.params.id, {
		avatar: imgPath
	})
	.then(res.redirect("/private"))
	.catch(error => {
		console.log(error)
	})
});

router.get("/uploadphoto/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
	res.render("passport/uploadphoto", {user: req.user});
})

router.post('/uploadphoto/:id', uploadCloud.single('photo'), (req, res, next) => {
	const imgPath = req.file.url;
	const imgName = req.file.originalname;
	const owner = req.params.id;
	const avatar = false;
	const newPhoto = new Photo({imgPath, imgName, owner, avatar})

	newPhoto.save()
	.then(photo => {
		res.redirect('/private')
	})
	.catch(error => {
		console.log(error)
	})
});

router.post("/delete/:id", (req, res, next) => {
	const photoID = req.params.id;

	Photo.findById(photoID)
	.then((photo) => {
		photo.remove()
		.then((response) => {
			res.redirect("/private")
		})
	})
	.catch((error) => {
		console.log(error);
	});
})

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
