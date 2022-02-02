// sydney-bus-sighter
// Scripts that handle user account information

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const USERDATA_PATH = path.join(__dirname,"/data/user-data.json");
const LOGIN = require(path.join(__dirname,"login.js"));

function changeUserInfo (token, email, uname, pass) {
    if (token == undefined || email == undefined ||
    uname == undefined || pass == undefined) {
        throw Error("400");
    }
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
    let oldUserInfo;
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            oldUserInfo = user;
        }
    });

    if (email != oldUserInfo.email) {
        const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (!emailRegex.test(email)) {
            throw Error("E01");
        }
        USERS.users.forEach(function (user) {
            if (user.email == email) {
                throw Error("E01");
            }
        });
    }

    if (uname != oldUserInfo.uname) {
        USERS.users.forEach(function (user) {
            if (user.uname == uname) {
                throw Error("E02");
            }
        });
    }

    hashedPass = LOGIN.hasher(pass);
    if (hashedPass != oldUserInfo.pass) {
        throw Error("E00");
    }

    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            user.email = email;
            user.uname = uname;
            user.earliestLogin = LOGIN.time();
        }
    });

    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
    return {newToken: LOGIN.newToken(uname)};
}

function changeUserPass (token, pass, passOne, passTwo) {
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

function getFavourite (token) {
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

function putFavourite (token, favourite) {
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

function deleteFavourite (token, favourite) {
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

function deleteUser (token, pass) {
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

module.exports = {changeUserInfo,changeUserPass,getFavourite,putFavourite,deleteFavourite,deleteUser}