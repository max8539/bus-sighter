// bus-sighter
// a project by a bus spotter based in Sydney, Australia
// https://github.com/max8539/bus-sighter

// favourites.js - Scripts that handle user favourites

const fs = require("fs");
const path = require("path");
const USERDATA_PATH = path.join(__dirname,"/data/user-data.json");
const BUSDATA_PATH = path.join(__dirname,"/data/bus-data.json")
const LOGIN = require(path.join(__dirname,"login.js"));
const SEARCH = require(path.join(__dirname,"search.js"));


function getFavourite (token) {
    // Verify request and login token
    if (token == undefined) {throw Error("400")}
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {throw Error("403")}

    const BUSES = JSON.parse(fs.readFileSync(BUSDATA_PATH));
    const USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    let favourites, favouritesList;
    favourites = [];
    
    // Get favourites list for user
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {favouritesList = user.favourites}
    });
    
    // Collect bus data for each favourite in list
    favouritesList.forEach(function (plate) {
        BUSES.buses.forEach(function (bus) {
            if (bus.plate == plate) {favourites.push(bus)}
        });
    });
    
    // Process list and return result
    return {favourites:SEARCH.infoToDisplay(favourites)}
}

function putFavourite (token, favourite) {
    // Verify request and login token
    if (token == undefined || favourite == undefined) {throw Error("400")}
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {throw Error("403");}

    const BUSES = JSON.parse(fs.readFileSync(BUSDATA_PATH));
    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    
    // Check that favourite bus plate exists
    let busExists = false;
    BUSES.buses.forEach(function (bus) {
        if (bus.plate == favourite) {busExists = true}
    });
    if (!busExists) {throw Error("400")}

    // Add favourite to user's list if not added before.
    USERS.users.forEach(function (user) {
        if (user.favourites.includes(favourite)) {
            throw Error("400");
        } else {
            user.favourites.push(favourite);
        }
    });
    
    // Write data and return
    fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
    return;
}

function deleteFavourite (token, favourite) {
    // Verify request and login token
    if (token == undefined || favourite == undefined) {throw Error("400")}
    tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {throw Error("403")}

    let USERS = JSON.parse(fs.readFileSync(USERDATA_PATH));
    USERS.users.forEach(function (user) {
        if (user.uname == tokenInfo.uname) {
            // Check if favourite exists in user's list
            if (!user.favourites.includes(favourite)) {throw Error("400")}
            
            // Locate and remove favourite from list
            let removeIndex = user.favourites.indexOf(favourite);
            user.favourites.splice(removeIndex,1);
        }

        // Write data and return
        fs.writeFileSync(USERDATA_PATH,JSON.stringify(USERS));
        return;
    });
}


module.exports = {getFavourite,putFavourite,deleteFavourite}