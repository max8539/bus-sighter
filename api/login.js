// sydney-bus-sighter
// Scripts that handle login, logout, and other user account management

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const jwt = require("jsonwebtoken");


function tokenCheck (token) {
    if (token == undefined) {
        throw Error("400");
    }
    
    const USERS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/user-data.json")));
    let tokenData;
    let result = {
        loggedIn: false,
    }
    
    // Attempt to verify and decode token, return logged out result if it fails.
    try {
        tokenData = jwt.verify(token, SETTINGS.tokenSecretKey);
    } catch (err) {
        return result;
    }
    // Check all token fields are present
    if (Object.keys(tokenData) != ["uname","createdTime"]) {
        return result;
    }
    // Check that token timestamp meets general server rules
    if (tokenData.createdTime > Date.now() || 
    Date.now() - tokenData.createdTime > (SETTINGS.tokenExpiryDays * 86400)) {
        return result;
    }
    // Check that username exists, and token timestamp is 
    // greater than the user's earliest login time, and
    // update return object if successful.
    USERS.users.forEach(function (user) {
        if (user.uname == tokenData.uname && user.earliestLogin <= tokenData.createdTime) {
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