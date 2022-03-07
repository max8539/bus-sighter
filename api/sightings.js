const fs = require("fs");
const path = require("path");

const LOGIN = require("./login.js");

const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/settings.json")));
const BUSES = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/bus-data.json")));
const OPERATORS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/operator-data.json")));

const SIGHTING_PATH = path.join(__dirname,"/data/sighting-data.json");

function postSighting (token, plate_fleetnum, route, description) {
    // Verify request and login token
    if (token == undefined || plate_fleetnum == undefined 
    || route == undefined || description == undefined) {
        throw Error("missingFields");
    }
    let tokenInfo = LOGIN.tokenCheck(token);
    if (!tokenInfo.valid) {throw Error("badToken")}

    // Verify that a description is given if this is required
    if (SETTINGS.requireDescription) {
        if (description == "") {throw Error("missingDescription")}
    }

    // Count number of buses with a matching plate or fleetnum,
    // error 400 if none found

    let matchingBuses = []
    BUSES.buses.forEach(function (bus) {
        if (bus["plate"].toLowerCase() == plate_fleetnum.toLowerCase()
        || bus["fleetnum"].toLowerCase() == plate_fleetnum.toLowerCase()) {
            matchingBuses.push(bus);
        }
    })
    if (matchingBuses.length == 0) {throw Error("badBus")}

    // Validate and record sighting if only one bus found,
    // else generate options if more than one bus found
    let SIGHTINGS = JSON.parse(fs.readFileSync(SIGHTING_PATH));
    if (matchingBuses.length == 1) {
        if (SETTINGS.verifyOperatorRoutes) {
            OPERATORS.operators.forEach(function (operator) {
                if (operator.opcode == matchingBuses[0].opcode) {
                    if (!operator.routes.includes(route)) {throw Error("badRoute")}
                }
            })
        }
        SIGHTINGS.sightings.push({
            plate:matchingBuses[0].plate,
            route:route,
            uname:tokenInfo.uname,
            description:description
        });
        fs.writeFileSync(SIGHTING_PATH,JSON.stringify(SIGHTINGS));
        return {success:true}
    } else {
        throw Error("501");
    }

}


module.exports = {postSighting}