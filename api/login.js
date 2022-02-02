// sydney-bus-sighter
// Scripts that handles login tokens and other user credentials management

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
        valid: false,
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
        if (user.uname == tokenData.uname && 
        user.earliestLogin <= tokenData.createdTime && user.active) {
            result.valid = true;
            result.uname = tokenData.uname;
        }
    });
    
    return result;
}

function login (uname, pass) {
    if (uname == undefined || pass == undefined) {
        throw Error("400");
    }
    
    const USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    let accountUname, token;
    let valid = false;
    let hashedPass = hasher(pass);

    USERS.users.forEach(function (user) {
        if (!valid && (uname == user.uname || uname == user.email) 
        && hashedPass == user.pass && user.active) {
            valid = true;
            accountUname = user.uname;
        }
    })

    if (valid) {
        return {token:newToken(accountUname)}
    }
    throw Error("invalidLogin");


}

function logoutAll (token) {
    if (token == undefined) {
        throw Error("400");
    }
    tokenInfo = tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }

    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            user.earliestLogin = time();
        }
    });
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
}

function registerUser (email, uname, passOne, passTwo) {
    if (email == undefined || uname == undefined || 
    passOne == undefined || passTwo == undefined) {
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
            throw new Error("E01");
        } else if (user.uname == uname) {
            throw new Error("E02");
        }
    });

    if (passOne != passTwo) {
        throw new Error("E03");
    }
    if (passOne.length < 6) {
        throw new Error("E04");
    }

    // Hash password
    let hashedPass = hasher(passOne);
    
    // Create user entry and write to file
    USERS.users.push({
        email: email,
        uname: uname,
        pass: hashedPass,
        earliestLogin: time(),
        active: true,
        favouritesList: [],

    })
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));

    // Generate and return login token
    return {token: newToken(uname)}

}

module.exports = {tokenCheck,login,logoutAll,registerUser}