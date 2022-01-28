const path = require("path");
const fs = require("fs");

let mode = {
    api: false,
    site: false
}

function errorHandler(res, err) {
    if (err.message == "400") {
        res.status(400).send("400 Bad request");
    } else if (err.message == "403") {
        res.status(403).send("403 Forbidden");
    } else if (err.message == "501") {
        console.log(501);
        res.status(501).send("501 Not Implemented");
    } else {
        res.status(500).send(`500 Internal Server Error\n\n${err}`);
        console.error(err);
    }
}

const modes = ["all", "api", "site"];
const argvError = `${process.argv[1]}: INCORRECT ARGUMENTS

Usage: node run.js [MODE]
where [MODE] is one of [all, api, site]:
- all: run the API and serve the website from the same server. If you'd like to run a fully functioning website from only one server, this is likely the option to choose.
- api: run only the API server (backend). To make use of the API, you'll need the website being served from elsewhere, or, if you prefer, other clients that can interface with the API correctly are also welcome.
- site: run only the website server (frontend). The website requires a working API for most functionality. Ensure that the URL of a working API is given in /site/settings.json`;

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
    mode.api = true;
    mode.site = true;
}

const express = require('express');
const app = express();
const API_SERACH = require(path.join(__dirname,"/api/search"));

app.use(express.json())

if (mode.api) {
    console.log("Running API server!");
    app.get("/api/tokencheck", function(req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.post("/api/login", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.post("/api/logout", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.post("/api/register", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.get("/api/operatorlist", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.get("/api/search", function (req, res) {
        try {
            let result;
            const QUERY = {
                plate_fleetnum: req.query.plate_fleetnum,
                body: req.query.body,
                chassis: req.query.chassis,
                depot: req.query.depot,
                operator: req.query.operator
            }
            result = API_SERACH.search(QUERY);
            res.json(result);
        } catch (err) {
            console.log(`Error ${err}`);
            errorHandler(res, err);
        }
    });
    app.get("/api/user", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.get("/api/userhistory", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.get("/api/bushistory", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.post("/api/sighting", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    app.delete("/api/deleteuser", function (req, res) {
        try {
            res.status(501).send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
}

if (mode.site) {
    console.log("Running website server!");
    app.get("/", function (req, res){
        res.sendFile(path.join(__dirname, "/site/index.html"));
    });
    app.get("/settings.json", function (req, res) {
        res.sendFile(path.join(__dirname, "/site/settings.json"));
    });
    app.get("/logo.png", function (req, res) {
        if (fs.existsSync(path.join(__dirname, "/site/logo.png"))) {
            res.sendFile(path.join(__dirname, "/site/logo.png"));
        } else {
            res.sendFile(path.join(__dirname, "/site/default.png"));
        }
    });
    app.get("/search", function (req, res) {
        res.status(501).send("501 Not Implemented");
    });
    app.get("/user", function (req, res) {
        res.status(501).send("501 Not Implemented");
    });
    app.get("/history", function (req, res) {
        res.status(501).send("501 Not Implemented");
    });
    app.get("/deleteuser", function (req, res) {
        res.status(501).send("501 Not Implemented");
    });
    app.use("/static", express.static(path.join(__dirname, "/site/static")));
}

app.use(function (req, res) {
    res.status(404).send("404 Not Found")
})

app.listen(8888);