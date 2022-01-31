// sydney-bus-sighter
// Scripts that handle login, logout, and other user account management

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const jwt = require("jsonwebtoken");
const USERDATA_PATH = path.join(__dirname,"/data/user-data.json");

function time () {
    return Math.floor(Date.now() / 1000);
}

function newToken (uname) {
    return jwt.sign({
        uname: uname,
        createdTime: time()
    },SETTINGS.tokenSecretKey,{noTimestamp:true})
}

function hasher (pass) {
    let hashOne = crypto.createHash("sha256");
    let hashTwo = crypto.createHash("sha256");
    hashOne.update(pass);
    hashTwo.update(hashOne.digest("base64"));
    return hashTwo.digest("base64");
}

function tokenCheck (token) {
    if (token == undefined) {
        throw Error("400");
    }
    
    const USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
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
    if (tokenData.uname == undefined || tokenData.createdTime == undefined) {
        return result;
    }
    // Check that token timestamp meets general server rules
    if (tokenData.createdTime > time() || 
    time() - tokenData.createdTime > (SETTINGS.tokenExpiryDays * 86400)) {
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

function registerUser (email, uname, pass) {
    if (email == undefined || uname == undefined || pass == undefined) {
        throw new Error("400");
    }

    // Verify email against regex
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!emailRegex.test(email)) {
        throw new Error("invalidEmail");
    }
    
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    
    // Check if email or username has already been used
    USERS.users.forEach(function (user) {
        if (user.email == email) {
            throw new Error("invalidEmail");
        } else if (user.uname == uname) {
            throw new Error("invalidUname");
        }
    });

    if (pass.length < 6) {
        throw new Error("badPassword")
    }

    // Hash password
    let hashedPass = hasher(pass);
    
    // Create user entry and write to file
    USERS.users.push({
        email: email,
        uname: uname,
        pass: hashedPass,
        earliestLogin: time()
    })
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));

    // Generate and return login token
    return {token: newToken(uname)}

}

module.exports = {tokenCheck,login,logoutAll,deleteUser,registerUser}