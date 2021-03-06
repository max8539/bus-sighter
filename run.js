// bus-sighter
// a project by a bus spotter based in Sydney, Australia
// https://github.com/max8539/bus-sighter

// run.js - Main script to run server

const path = require("path");
const fs = require("fs");
const CORS = require("cors");

let mode = {
    api: false,
    site: false
}

// Convert thrown errors to HTTP statuses
function errorHandler(res, err) {
    if (err.message == "400") {
        res.status(400).type("text").send("400 Bad Request");
    } else if (err.message == "403") { 
        res.status(403).type("text").send("403 Forbidden");
    } else if (err.message == "501") {
        res.status(501).type("text").send("501 Not Implemented");
    } else if (err.message == "missingFields") {
        res.status(400).type("text").send("Missing request fields");
    } else if (err.message == "badToken") {
        res.status(403).type("text").send("Login token is invalid or not provided");
    } else if (err.message == "invalidLogin") {
        res.status(400).type("text").send("Invalid login");
    } else if (err.message == "badEmail") {
        res.status(400).type("text").send("Email is invalid or already in use");
    } else if (err.message == "badUname") {
        res.status(400).type("text").send("Username is invalid or already in use");
    } else if (err.message == "passNotMatch") {
        res.status(400).type("text").send("Passwords do not match");
    } else if (err.message == "badPass") {
        res.status(400).type("text").send("Password is too weak");
    } else if (err.message == "badBus") {
        res.status(400).type("text").send("Bus not found")
    } else if (err.message == "badRoute") {
        res.status(400).type("text").send("Invalid route for this bus")
    } else if (err.message == "missingDescription") {
        res.status(400).type("text").send("A description is required")
    } else {
        res.status(500).type("text").send(`500 Internal Server Error\n\n${err}`);
        console.error(err);
    }
}

const modes = ["all", "api", "site"];
const argvError = `${process.argv[1]}: INCORRECT ARGUMENTS

Usage: node run.js [MODE] [PORT]
where [MODE] is one of the options below, 
and [PORT] is the port that the server runs on.

[MODE] options:
- all: run the API and serve the website from the same server. If you'd like to run a fully functioning website from only one server, this is likely the option to choose.
- api: run only the API server (backend). To make use of the API, you'll need the website being served from elsewhere, or, if you prefer, other clients that can interface with the API correctly are also welcome.
- site: run only the website server (frontend). The website requires a working API for most functionality. Ensure that the URL of a working API is given in /site/settings.json`;

// Checks that arguments are correct and sets mode. Otherwise, prints error message and exits.
if (process.argv.length != 4) {
    console.log(argvError);
    process.exit(1);
} else if (!modes.includes(process.argv[2]) || Number(process.argv[3]) == NaN) {
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
const APP = express();

CORS(APP);
APP.use(express.json());


// API server routes
if (mode.api) {
    console.log("Running API server!");
    const SERACH = require("./api/search.js");
    const LOGIN = require("./api/login.js");
    const FAVOURITES = require("./api/favourites.js");
    const SIGHTINGS = require("./api/sightings.js");
    
    APP.get("/api/tokencheck", function(req, res) {
        try {
            res.json(LOGIN.tokenCheck(req.query.token));
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.post("/api/login", function (req, res) {
        try {
            res.json(LOGIN.login(req.body.uname,req.body.pass));
        } catch (err) {
            if (err.message == "invalidLogin") {
                res.status(400).type("text").send("Invalid username or password.")
            } else {
                errorHandler(res, err);
            }
        }
    });
    APP.post("/api/logoutall", function (req, res) {
        try {
            LOGIN.logoutAll(req.body.token);
            res.type("text").send("Success");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.post("/api/register", function (req, res) {
        try {
            let token = LOGIN.registerUser(req.body.email, req.body.uname, req.body.passOne, req.body.passTwo);
            res.json(token);
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.put("/api/changeuserinfo", function (req, res) {
        try {
            let newToken = LOGIN.changeUserInfo(req.body.token,req.body.email,req.body.uname,req.body.pass);
            res.json(newToken);
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.put("/api/changeuserpass", function (req, res) {
        try {
            let newToken = LOGIN.changeUserPass(req.body.token,req.body.pass,req.body.passOne,req.body.passTwo);
            res.json(newToken);
        } catch (err) {
            errorHandler(res, err);
        }
    })
    APP.delete("/api/deleteuser", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/operatorlist", function (req, res) {
        try {
            res.json(SERACH.operatorsList());
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/search", function (req, res) {
        try {
            let result;
            const QUERY = {
                plate_fleetnum: req.query.plate_fleetnum,
                body: req.query.body,
                chassis: req.query.chassis,
                depot: req.query.depot,
                operator: req.query.operator
            }
            result = SERACH.search(QUERY);
            res.json(result);
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/userinfo", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/userhistory", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/bushistory", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.post("/api/sighting", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.post("/api/resolveoptions", function (req, res) {
        try {
            res.status(501).type("text").send("501 Not Implemented");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.get("/api/favourites", function (req, res) {
        try {
            res.json(FAVOURITES.getFavourite(req.query.token));
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.put("/api/favourites", function (req, res) {
        try {
            FAVOURITES.putFavourite(req.body.token,req.body.favourite);
            res.type("text").send("Success");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.delete("/api/favourites", function (req, res) {
        try {
            FAVOURITES.deleteFavourite(req.body.token,req.body.favourite);
            res.type("text").send("Success");
        } catch (err) {
            errorHandler(res, err);
        }
    });
    APP.post("/api/postsighting", function (req, res) {
        try {
            let result = SIGHTINGS.postSighting(req.body.token, req.body.plate_fleetnum, req.body.route, req.body.description);
            res.json(result);
        } catch (err) {
            errorHandler(res, err);
        }
    })
}

// Website server routes
if (mode.site) {
    console.log("Running website server!");
    APP.post("/debug", function (req, res) {
        console.log(req.body)
        res.send(req.body.test);
    })
    APP.get("/", function (req, res) {
        res.sendFile(path.join(__dirname, "/site/index.html"));
    });
    APP.get("/settings.json", function (req, res) {
        res.sendFile(path.join(__dirname, "/site/settings.json"));
    });
    APP.get("/logo.png", function (req, res) {
        if (fs.existsSync(path.join(__dirname, "/site/logo.png"))) {
            res.sendFile(path.join(__dirname, "/site/logo.png"));
        } else {
            res.sendFile(path.join(__dirname, "/site/default.png"));
        }
    });
    APP.get("/search", function (req, res) {
        res.status(501).type("text").send("501 Not Implemented");
    });
    APP.get("/bus", function (req, res) {
        rres.status(501).type("text").send("501 Not Implemented");
    })
    APP.get("/user", function (req, res) {
        rres.status(501).type("text").send("501 Not Implemented");
    });
    APP.get("/deleteuser", function (req, res) {
        rres.status(501).type("text").send("501 Not Implemented");
    });
    APP.use("/static", express.static(path.join(__dirname, "/site/static")));
}

// Catches unhandled routes - send HTTP 404
APP.use(function (req, res) {res.status(404).type("text").send("404 Not Found")});

// Run server with port given in command line arguments
APP.listen(Math.floor(Number(process.argv[3])));