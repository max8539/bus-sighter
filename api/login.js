// sydney-bus-sighter
// Scripts that handle login, logout, and other user account management

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const jwt = require("jsonwebtoken");
const { resourceLimits } = require("worker_threads");


function tokenCheck (token) {
    const USERS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/user-data.json")));
    let tokenData;
    let result = {
        loggedIn: false,
    }
    try {
        tokenData = jwt.verify(token, SETTINGS.tokenSecretKey);
    } catch (err) {
        return result;
    }
    if (Object.keys(tokenData) != ["uname","createdTime"]) {
        return result;
    }
    if (tokenData.createdTime > Date.now() || 
    Date.now() - tokenData.createdTime > (SETTINGS.tokenExpiryDays * 86400)) {
        return result;
    }
    USERS.users.forEach(function (user) {
        if (user.uname == tokenData.uname && user.earliestLogin < tokenData.createdTime) {
            result.loggedIn = true;
            result.uname = tokenData.uname;
        }
    });
    return result;
}

function login (uname, pass) {

}

function logoutAll (token) {

}

function deleteUser (token) {

}

function register (uname, pass) {

}

module.exports = {tokenCheck,login,logoutAll,deleteUser,register}