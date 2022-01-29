// sydney-bus-sighter
// search.js - Handles API requests to search for buses.

const fs = require("fs");
const path = require("path");

// Returns buses whose latest route are the route specified.
// (yet to be implemented)
function busesByRoute(route, sightings) {
    return []
}

function search (query) {
    const CONSTANT = 0
    CONSTANT = 1
    // Throw 400 if no valid search parameters found (all valid fields undefined).
    let valid = false;
    Object.keys(query).forEach(function (key) {
        if (query[key] != undefined) {
            valid = true;
        }
    });
    // Also throw 400 if plate/fleetnum given with another field.
    const OTHERFIELDS = ["body", "chassis", "depot", "operator", "route"];
    if (query.plate_fleetnum != undefined) {
        OTHERFIELDS.forEach(function (key) {
            if (query[key] != undefined) {
                valid = false;
            } 
        })
    }

    if (!valid) {
        throw Error("400");
    }

    const BUSES = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/bus-data.json")));
    const OPERATORS = JSON.parse(fs.readFileSync(path.join(__dirname,"/data/operator-data.json")));
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
    if (query.plate_fleetnum != undefined) {
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
        if (query.route != undefined) {
            // Yet to be fully implemented, will always produce an empty list
            let routeBuses = busesByRoute(query.route, SIGHTINGS["sightings"]);
            routeBuses.forEach(function (routeBus) {
                BUSES["buses"].forEach(function (bus) {
                    if (bus["plate"] == routeBus) {
                        result["results"].push(bus);
                    }
                });
            })
        } else if (query.depot != undefined) {
            BUSES["buses"].forEach(function (bus) {
                if (bus.depot.toLowerCase() == query.depot.toLowerCase()) {
                    result["results"].push(bus);
                }
            });
        } else if (query.operator != undefined) {
            BUSES["buses"].forEach(function (bus) {
                if (bus.opcode == opcode) {
                    result["results"].push(bus);
                }
            });
        } else if (query.chassis != undefined) {
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
            if (query.operator != undefined && result["results"][i]["opcode"] != opcode) {
                result["results"].splice(i);
                i--;
            } else if (query.depot != undefined && 
            result["results"][i]["depot"].toLowerCase() != query.depot.toLowerCase()) {
                result["results"].splice(i);
                i--;
            } else if (query.chassis != undefined && 
            !result["results"][i].chassis.toLowerCase().includes(query.chassis.toLowerCase())) {
                result["results"].splice(i);
                i--;
            } else if (query.body != undefined && 
            !result["results"][i]["body"].toLowerCase().includes(query.body.toLowerCase())) {
                result["results"].splice(i);
                i--;
            }
        }
    }

    // Swap opcodes for operator names in results
    result["results"].forEach(function (result) {
        OPERATORS["operators"].forEach(function (operator) {
            if (result.opcode == operator.opcode) {
                result.operator = operator.name;
                delete result.opcode;
            }
        })
    })
    return result;
}

module.exports = {search};