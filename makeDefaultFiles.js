// sydney-bus-sighter
// A script to generate JSON files with basic structure that are required by the software.
// Files that already exist will not be changed.

const fs = require("fs");
const path = require("path");

// API and website settings.json files
// These should be mofidied to contain the appropriate values for your deployment.
if (!fs.existsSync(path.join(__dirname,"/api/settings.json"))) {
    fs.writeFileSync(path.join(__dirname,"/api/settings.json"),`{
    "tokenSecretKey": "insert-unique-key-here",
    "tokenExpiryDays": 2,
    "requireDescription": true,
    "verifyOperatorRoutes": true
}`)
}
if (!fs.existsSync(path.join(__dirname,"/site/settings.json"))) {
    fs.writeFileSync(path.join(__dirname,"/site/settings.json"),`{
    "apiDomain": "http://insert-domain-here.com"
}`)
}

// Data files - These files can be left as-is, and will be managed by the software.
if (!fs.existsSync(path.join(__dirname, "/api/data/user-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "/api/data/user-data.json"), '{"users":[]}');
}
if (!fs.existsSync(path.join(__dirname, "/api/data/sighting-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "/api/data/sighting-data.json"), '{"sightings":[]}');
}

// Data files - These should be modified by the website maintainers to contain the appropriate data.
if (!fs.existsSync(path.join(__dirname, "/api/data/bus-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "/api/data/bus-data.json"), '{"buses":[]}');
}
if (!fs.existsSync(path.join(__dirname, "/api/data/operator-data.json"))) {
    fs.writeFileSync(path.join(__dirname, "/api/data/operator-data.json"), '{"operators":[]}');
}
