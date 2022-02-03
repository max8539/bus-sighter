// sydney-bus-sighter
// Scripts that handle user account information

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { hasher } = require("./login");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const USERDATA_PATH = path.join(__dirname,"/data/user-data.json");
const LOGIN = require(path.join(__dirname,"login.js"));


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


module.exports = {getFavourite,putFavourite,deleteFavourite}