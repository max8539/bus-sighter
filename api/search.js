// bus-sighter
// a project by a bus spotter based in Sydney, Australia
// https://github.com/max8539/bus-sighter

// search.js - Handles API requests to list operators and search for buses.

const fs = require("fs");
const path = require("path");
const BUSES = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/bus-data.json")));
const OPERATORS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/operator-data.json")));

function operatorsList() {
    let results = {operatorNames:[]};
    OPERATORS.operators.forEach(function (operator) {
        results.operatorNames.push(operator.name);
    })
    return results;
}

// Returns buses whose latest route are the route specified.
// (yet to be implemented)
function busesByRoute(route, sightings) {
    return []
}

function infoToDisplay(buses) {
    const SIGHTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/sighting-data.json")));
    buses.forEach(function (bus) {
        OPERATORS["operators"].forEach(function (operator) {
            if (bus.opcode == operator.opcode) {
                bus.operator = operator.name;
                delete bus.opcode;
            }
        });
    });
    return buses;
}

function search (query) {
    // Throw 400 if no valid search parameters found (all valid fields undefined).
    let valid = false;
    Object.keys(query).forEach(function (key) {
        if (query[key] != undefined && query[key] != "") {valid = true}
    });
    // Also throw 400 if plate/fleetnum given with another field.
    const OTHERFIELDS = ["body", "chassis", "depot", "operator", "route"];
    if (query.plate_fleetnum != undefined) {
        OTHERFIELDS.forEach(function (key) {
            if (query[key] != undefined && query[key] != "") {valid = false} 
        })
    }

    if (!valid) {throw Error("missingFields")}

    const SIGHTINGS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/sighting-data.json")));

    // Save opcode to variable if used as part of search
    let opcode = undefined;
    if (query.operator != undefined) {
        OPERATORS["operators"].forEach(function (operator) {
            if (operator.name.toLowerCase() == query.operator.toLowerCase()) {
                opcode = operator.opcode;
            }
        })
    }

    let result = {"results":[]};
    if (query.plate_fleetnum != undefined && query.plate_fleetnum != "") {
        // Add buses with matching plate or fleetnum to results.
        BUSES["buses"].forEach(function (bus) {
            if (bus["plate"].toLowerCase() == query.plate_fleetnum.toLowerCase()
            || bus["fleetnum"].toLowerCase() == query.plate_fleetnum.toLowerCase()) {
                result["results"].push(bus);
            }
        });
    } else {
        // Generate an initial list of results from one property, selected in this order (first non-undefined field):
        // Route (yet to be implemented) -> Depot -> Operator -> Chassis -> Body
        if (query.route != undefined && query.route != "") {
            // Yet to be fully implemented, will always produce an empty list
            let routeBuses = busesByRoute(query.route, SIGHTINGS["sightings"]);
            routeBuses.forEach(function (routeBus) {
                BUSES["buses"].forEach(function (bus) {
                    if (bus["plate"] == routeBus) {
                        result["results"].push(bus);
                    }
                });
            })
        } else if (query.depot != undefined && query.depot != "") {
            BUSES["buses"].forEach(function (bus) {
                if (bus.depot.toLowerCase() == query.depot.toLowerCase()) {
                    result["results"].push(bus);
                }
            });
        } else if (query.operator != undefined && query.operator != "") {
            BUSES["buses"].forEach(function (bus) {
                if (bus.opcode == opcode) {
                    result["results"].push(bus);
                }
            });
        } else if (query.chassis != undefined && query.chassis != "") {
            BUSES["buses"].forEach(function (bus) {
                if (bus.chassis.toLowerCase().includes(query.chassis.toLowerCase())) {
                    result["results"].push(bus);
                }
            })
        } else {
            BUSES["buses"].forEach(function (bus) {
                if (bus.body.toLowerCase().includes(query.body.toLowerCase())) {
                    result["results"].push(bus);
                }
            })
        }

        // Filter results to only include ones matching other search paramters
        for (let i = 0; i < result["results"].length; i++) {
            if (query.operator != undefined && query.operator != "" &&
            result["results"][i]["opcode"] != opcode) {
                result["results"].splice(i,1);
                i--;
            } else if (query.depot != undefined && query.depot != "" &&
            result["results"][i]["depot"].toLowerCase() != query.depot.toLowerCase()) {
                result["results"].splice(i,1);
                i--;
            } else if (query.chassis != undefined && query.chassis != "" &&
            !result["results"][i].chassis.toLowerCase().includes(query.chassis.toLowerCase())) {
                result["results"].splice(i,1);
                i--;
            } else if (query.body != undefined && query.body != "" &&
            !result["results"][i]["body"].toLowerCase().includes(query.body.toLowerCase())) {
                result["results"].splice(i,1);
                i--;
            }
        }
    }

    // Swap opcodes for operator names in results
    result.results = infoToDisplay(result.results);
    return result;
}

module.exports = {operatorsList,search,infoToDisplay};