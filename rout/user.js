const { express, io } = require("./mainRout");
const Event = require("events");
const sendmail = require("sendmail")();
var nodemailer = require('nodemailer');
const config = require("config");
const userValidator = require("../module/user/validate");
const jwt = require("jsonwebtoken");
const ut = require("../module//utility");
const user = require("../module/user/user");
const preregister = require("../module/user/preregister");
const { func } = require("joi");
const rateLimit = require('express-rate-limit');
const rout = express.Router();

rout.events = new Event();
rout.get("/admin/", (req, res) => {
  // to do roles
  res.render(config.get("template") + "/page/user/admin", { user: req.user });
});

rout.get("/logout/", (req, res) => {
  rout.events.emit("userLogOut", req.user);
  res.cookie("user", "").redirect("/");
});
rout.get("/login/", (req, res) => {
  res.render(config.get("template") + "/page/user/login", { user: req.user });
});
rout.post("/login/", (req, res) => {
  let myRes = userValidator.validator(req.body);
  if (!myRes.state) {
    return res.send(JSON.stringify(myRes));
  }
  req.body.mailUser = req.body.mailUser.toLowerCase().trim();
  req.body.password = req.body.password.trim();
  // todo [{email: req.body.emailUser}, {userName: req.body.emailUser}]
  //if key is not exist returns true//   s//  .and ([{password: req.body.password}])
  user
    .findOne({ password: req.body.password })
    .or([{ email: req.body.mailUser }, { userName: req.body.mailUser }])
    .then((dbUser) => {
      if (!dbUser) {
        myRes.state = false;
        res.send(JSON.stringify(myRes));
        return;
      }
      myRes.message = user.getUserLoginCockie(dbUser);
      res.cookie("user", myRes.message).send(JSON.stringify(myRes));
    });
});
rout.get("/recovery/", (req, res) => {
  res.render(config.get("template") + "/page/user/recovery1", {
    user: req.user,
  });
});
rout.post("/recovery/", (req, res) => {
  let myRes = userValidator.validator(req.body);
  if (!myRes.state) {
    return res.send(JSON.stringify(myRes));
  }
  req.body.email = req.body.email.toLowerCase().trim();
  // todo [{email: req.body.emailUser}, {userName: req.body.emailUser}]
  //if key is not exist returns true//   s//  .and ([{password: req.body.password}])
  user.findOne({ email: req.body.email }).then((dbUser) => {
    if (!dbUser) {
      myRes.state = false;
      res.send(JSON.stringify(myRes));
      return;
    }
    let time = Date.now();
    dbUser.recoveryLink =
      dbUser._id + "tt-tt" + ut.getRndInteger(123456, 987654) + "tt-tt" + time;
    dbUser.save().then((user) => {
      let link = "/user/note/recovery";
      myRes.message = link;
      sendmail(
        {
          from: "no-reply@metachessmind.com",
          to: req.body.email,
          subject: "Password recovery", // "بازیابی رمز عبور",
          html: `
                    
                    <h4 >
                     Click on the link below to change the password
                    </h4>
                    <br>
                    <a href="${config.get("base")}/user/recovery/${user.recoveryLink
            }">
                    ${config.get("base")}/user/recovery/${user.recoveryLink}
                    <a>
                  `,
        },
        function (err, reply) {
          // console.log (err && err.stack);
          // console.dir (reply);
        }
      );

      res.send(JSON.stringify(myRes));
    });
  });
});
rout.get("/recovery/:link", (req, res) => {
  let link = req.params.link.trim();
  let time = link.split("tt-tt");
  time = Number(time[time.length - 1]);
  // if (Date.now () - 24 * 60 * 60 * 1000 > time) return onErr ();

  user.findOne({ recoveryLink: link }).then((dbUser) => {
    if (dbUser) {
      res.render(config.get("template") + "/page/user/recovery2", {
        user: req.user,
      });
    } else {
      onErr();
    }
  });

  function onErr() {
    res.render(config.get("template") + "/page/user/note", {
      note: "Or your email link has expired, and if you have just registered, your user account has been confirmed and you can log in.", //" یا مدت زمان لینک ایمیل شما منقضی شده و اگر به تازگی ثبت نام کرده اید کاربری شما تایید شده و از قمت ورود اقدام کنید.",
      user: req.user,
    });
  }
  // res.send (;
});
rout.post("/recovery/:link", (req, res) => {
  let myRes = userValidator.validator(req.body);
  if (!myRes.state) {
    return res.send(JSON.stringify(myRes));
  }
  let link = req.params.link.trim();
  let time = link.split("tt-tt");
  time = Number(time[time.length - 1]);
  if (Date.now() - 24 * 60 * 60 * 1000 > time) return onErr();

  user.findOne({ recoveryLink: link }).then((dbUser) => {
    if (dbUser) {
      dbUser.password = req.body.password;
      dbUser.recoveryLink = "";
      dbUser.save().then((bdUser2) => {
        myRes.state = true;
        let message = user.getUserLoginCockie(bdUser2);
        res.cookie("user", message).send(JSON.stringify(myRes));
      });
    } else {
      return onErr();
    }
  });

  function onErr() {
    myRes.state = false;
    myRes.message = "Your email link has expired."; //"مدت زمان لینک ایمیل شما منقضی شده.";
    res.send(JSON.stringify(myRes));
    return;
  }
});
rout.setReqUser = function () {
  return async function (req, res, next) {
    user.setUserFromCoockies(req).then(() => {
      if ("setToLogOut" in req.user) {
        if (req.user.setToLogOut) {
          res.cookie("user", "").redirect("/");
          return;
        }
      }
      next();
    });
  };
};
rout.get("/register/", (req, res) => {
  res.render(config.get("template") + "/page/user/register", {
    user: req.user,
  });
});
const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(200).json({
      state: false,
      code: 'RATE_LIMITED',
      message: 'Too many sign-up attempts. Please try later.'
    });
  },
});


rout.post("/register/",registerLimiter, (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  req.body.userName = req.body.userName.toLowerCase().trim();
  req.body.password = req.body.password.trim();
  let myRes = userValidator.validator(req.body);
  if (!myRes.state) {
    return res.send(JSON.stringify(myRes));
  }
  preregister.isInDb(req.body.email, req.body.userName).then((dbreg) => {
    if (dbreg) {
      myRes.state = false;
      myRes.message = dbreg;
      res.send(JSON.stringify(myRes));
    } else {
      preregister.createNew(req.body).then((dbPre) => {
        let link = "/user/note/activfromemail";
        myRes.message = link;
        sendmail(
          {
            from: "no-reply@metachessmind.com",
            to: req.body.email,
            subject: "Email Confirmation", //"تایید ایمیل",
            html: `
                    
                    <h4 >
                    Complete your registration by clicking on the link below
                    </h4>
                    <br>
                    <a href="${config.get("base")}/user/register/${dbPre.link}">
                    ${config.get("base")}/user/register/${dbPre.link}
                    <a>
                  `,
          },
          function (err, reply) {
            console.log(err && err.stack);
            // console.dir (reply);

            var transporter = nodemailer.createTransport({
              host: 'metachessmind.com',
              // port: 25,
              // host: 'mail.metachessmind.com',
              // port: 25,
              secure: false,
              auth: {
                user: 'no-reply@metachessmind.com',
                pass: 'IG;0zY@3E43bhf'
              },
              tls: {
                rejectUnauthorized: false
              }

              // service: 'localhost',
            });

            var mailOptions = {
              from: 'no-reply@metachessmind.com',
              to: req.body.email,
              subject: 'Email Confirmation',
              // text: 'That was easy!',
              html: `
                    
                    <h4 >
                    Complete your registration by clicking on the link below
                    </h4>
                    <br>
                    <a href="${config.get("base")}/user/register/${dbPre.link}">
                    ${config.get("base")}/user/register/${dbPre.link}
                    <a>
                  `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

          }
        );

        res.send(JSON.stringify(myRes));
      });
    }
  });
});
rout.get("/register/:link", (req, res) => {
  preregister.getFromLink(req.params.link).then((dbUser) => {
    if (dbUser) {
      let userForDb = {
        userName: dbUser.userName,
        registerTime: Date.now(),
        email: dbUser.email,
        password: dbUser.password,
      };
      user.creatNewUser(userForDb).then((ans) => {
        if (ans) {
          preregister.deleteOne({ _id: dbUser._id }).then((result) => {
            let message = user.getUserLoginCockie(ans);
            res.cookie("user", message).redirect("/");
          });
        }
      });
    } else {
      res.render(config.get("template") + "/page/user/note", {
        note: "Your email link has expired.", //"مدت زمان لینک ایمیل شما منقضی شده.",
        user: req.user,
      });
    }
  });

  // res.send (;
});
rout.get("/note/:note", (req, res) => {
  let note = req.params.note;
  let noteObj = {};
  switch (note) {
    case "activfromemail":
      noteObj.note =
        "Go to your email to activate your account. It may be in your spam folder.";
      // "برای فعال سازی اکانت خود به ایمیل خود مراجعه کنید. ممکن است که ایملی در پوشه اسپم شما قرار گرفته باشد.)spam.";
      break;
    case "recovery":
      noteObj.note =
        "Go to your email to recover your password. The email may be in your spam folder.";
      //"برای بازیابی رمز عبور خود به ایمیل خود مراجعه کنید. ممکن است که ایملی در پوشه اسپم شما قرار گرفته باشد.)spam.";
      break;
    default:
      break;
  }
  res.render(config.get("template") + "/page/user/note", {
    user: req.user,
    note: noteObj.note,
  });
});
rout.get("/profile/", (req, res) => {
  // preregister.getFromLink(req.params.link).then(dbUser => {
  //     if (dbUser) {
  //         let userForDb = {
  //             userName: dbUser.userName,
  //             registerTime: Date.now(),
  //             email: dbUser.email,
  //             password: dbUser.password,
  //         };
  //         user.creatNewUser(userForDb).then(ans => {
  //             if (ans) {
  //                 preregister.deleteOne({ _id: dbUser._id }).then(result => {
  //                     let message = user.getUserLoginCockie(ans);
  //                     res.cookie('user', message).redirect('/');
  //                 });
  //             }
  //         });
  //     } else {
  //         res.render(config.get('template') + '/page/user/note', {
  //             note: 'مدت زمان لینک ایمیل شما منقضی شده.',
  //             user: req.user,
  //         });
  //     }
  // });

  // res.send (;
  res.render(config.get("template") + "/page/profile/dashboard", {
    user: req.user,
  });
});
rout.io = {};
rout.io.getUsersFromDbWhithPublicData = async function (userName) {
  let users = await user
    .find({ userName: { $regex: ".*" + userName + ".*" } })
    .limit(10);
  let pubUsers = [];
  users.forEach((u) => {
    pubUsers.push(user.setUserPublicData(u));
  });
  return pubUsers;
};
rout.io.getUserPublicData = async function (userName) {
  let dbuser = await user.findOne({ userName: userName });
  dbuser = user.setUserPublicData(dbuser);
  return dbuser;
};
rout.api = {};

rout.api.updatePuzzleRating = async function (userName, change) {
  let dbuser = await user.findOne({ userName: userName });
  dbuser.puzzle = dbuser.puzzle + change;
  console.log(await dbuser.save());
};
rout.setUserLanguage = async function (userData, lang) {
  let up = await user.updateOne({ _id: userData.id }, { $set: { lang: lang } });
};
// rout.tS = 0;
io.on("connect", function (socket) {
  socket.on("search", function (user, ack) {
    rout.io.getUsersFromDbWhithPublicData(user).then((ansers) => {
      ack(ansers);
    });
  });
});

module.exports = rout;
