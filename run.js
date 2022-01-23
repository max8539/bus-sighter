let mode = {
    api: false,
    site: false
}

function argvCheck() {
    const modes = ["all", "api", "site"];
    const argvError = `${process.argv[1]}: INCORRECT ARGUMENTS

Usage: node run.js [MODE]
where [MODE] is one of:
  - all: run the API and serve the website from the same server. If you'd like to run a fully functioning website from only one server, this is likely the option to choose.

Or, if you'd like to run the API (backend) and website (frontend) separetely (you'll need two servers)...
  - api: run only the API server (backend). To make use of the API, you'll need the website being served from elsewhere, or, if you prefer, other clients that can interface with the API correctly are also welcome.
  - site: run only the website server (frontend). The website requires a working API for most functionality. Ensure that the URL of a working API is given in site/settings.json`;

    // Checks that arguments are correct and sets mode. Otherwise, prints error message and exits.
    if (process.argv.length != 3) {
        console.log(argvError);
        process.exit(1);
    } else if (!modes.includes(process.argv[2])) {
        console.log(argvError);
        process.exit(1);
    } else if (process.argv[2] == "api") {
        mode.api = true;
    } else if (process.argv[2] == "site") {
        mode.site = true;
    } else {
        api = true;
        site = true;
    }
}


argvCheck();

const express = require('express');
const app = express();
const path = require("path");
const { argv } = require('process');

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/site/hello-world.html'));
});

app.listen(8888);