// sydney-bus-sighter
// Scripts that handles login tokens and other user credentials management

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const jwt = require("jsonwebtoken");
const USERDATA_PATH = path.join(__dirname,"/data/user-data.json");

// Returns UTC timestamps without milliseconds
function time () {
    return Math.floor(Date.now() / 1000);
}

// Create and sigh login token with givne uname and current time as timestamp
function newToken (uname) {
    return jwt.sign({
        uname: uname,
        createdTime: time()
    },SETTINGS.tokenSecretKey,{noTimestamp:true})
}

// Password hashing function: runs SHA256 twice and outputs base64 string
function hasher (pass) {
    let hashOne = crypto.createHash("sha256");
    let hashTwo = crypto.createHash("sha256");
    hashOne.update(pass);
    hashTwo.update(hashOne.digest("base64"));
    return hashTwo.digest("base64");
}

// Function to verify login tokens
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

// Given a correct username and password, generate a new login token for the user.
function login (uname, pass) {
    if (uname == undefined || pass == undefined) {
        throw Error("400");
    }
    
    const USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    let accountUname, token;
    let valid = false;
    let hashedPass = hasher(pass);

    // Check all users for a matching email/uname and matching password
    USERS.users.forEach(function (user) {
        if (!valid && (uname == user.uname || uname == user.email) 
        && hashedPass == user.pass && user.active) {
            valid = true;
            accountUname = user.uname;
        }
    })

    // Return login token or throw error if login was unsuccessful.
    if (valid) {
        return {token:newToken(accountUname)}
    } else {
        throw Error("E00");
    }
    
}

// Invalidate all existing login tokens for a user
function logoutAll (token) {
    // Verify login token
    if (token == undefined) {
        throw Error("400");
    }
    tokenInfo = tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }

    // Advance user's earliest login time to current time
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            user.earliestLogin = time();
        }
    });
    
    // Write data and return
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
    return;
}

function registerUser (email, uname, passOne, passTwo) {
    if (email == undefined || uname == undefined || 
    passOne == undefined || passTwo == undefined) {
        throw Error("400");
    }

    // Verify email against regex
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!emailRegex.test(email)) {
        throw Error("E01");
    }
    
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    
    // Check if email or username has already been used
    USERS.users.forEach(function (user) {
        if (user.email == email) {
            throw Error("E01");
        } else if (user.uname == uname) {
            throw Error("E02");
        }
    });

    // Verify passowrds match, and password is not weak
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
        favourites: [],

    })
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));

    // Generate and return login token
    return {token: newToken(uname)}

}

function changeUserInfo (token, email, uname, pass) {
    // Validate request and token
    if (token == undefined || email == undefined ||
    uname == undefined || pass == undefined) {
        throw Error("400");
    }
    tokenInfo = tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
    
    // Temporarily store existing data
    let oldUserInfo;
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            oldUserInfo = user;
        }
    });

    // Validate email if a new one is provided
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

    // Validate username if a new one is given
    if (uname != oldUserInfo.uname) {
        USERS.users.forEach(function (user) {
            if (user.uname == uname) {
                throw Error("E02");
            }
        });
    }

    // Ensore password given is correct, this check should be done last
    hashedPass = hasher(pass);
    if (hashedPass != oldUserInfo.pass) {
        throw Error("E00");
    }

    // Write data, invalidate existing login tokens
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            user.email = email;
            user.uname = uname;
            user.earliestLogin = time();
        }
    });

    // Write data and return new login token
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
    return {newToken: newToken(uname)};
}

function changeUserPass (token, pass, passOne, passTwo) {
    // Validate request and token
    if (token == undefined || pass == undefined ||
    passOne == undefined || passTwo == undefined) {
        throw Error("400");
    }
    tokenInfo = tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }

    // Check that new passwords match, and new password is not weak
    if (passOne != passTwo) {
        throw Error("E03");
    }
    if (passOne.length < 6) {
        throw Error("E04");
    }

    // Ensure existing password given is correct, this check should be done last.
    // If password is correct, write new password and invalid existing login tokens.
    hashedPass = hasher(pass);
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            if (hashedPass == user.pass) {
                user.pass = hasher(passOne);
                user.earliestLogin = time();
            } else {
                throw Error("E00");
            }
        }
    });

    // Write changes and generate new login token
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
    return {newToken:newToken(tokenInfo.uname)}

}

function deleteUser (token, pass) {
    tokenInfo = tokenCheck(token);
    if (!tokenInfo.valid) {
        throw Error("403");
    }
}

module.exports = {tokenCheck,hasher,login,logoutAll,newToken,registerUser,changeUserInfo,changeUserPass,deleteUser}