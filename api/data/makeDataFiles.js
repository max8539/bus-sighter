// sydney-bus-sighter.json

// A script to check for the existence of required data files, and 
// create a skeleton of any files that don't exist, such that the server will function.
// (existing files will be left as-is)
//
// user-data.json and sighting-data.json will be managed by the server, however
// bus-data.json and operator-data.json need to be manually filled
// by the website maintainer(s) with the relavent information.


const fs = require("fs");
const path = require("path");

if (!fs.existsSync(path.join(__dirname, "user-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "user-data.json"), '{"users":[]}');
}
if (!fs.existsSync(path.join(__dirname, "sighting-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "sighting-data.json"), '{"sightings":[]}');
}
if (!fs.existsSync(path.join(__dirname, "bus-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "bus-data.json"), '{"buses":[]}');
}
if (!fs.existsSync(path.join(__dirname, "operator-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "operator-data.json"), '{"operators":[]}');
}
