const express = require('express');
const app = express();
const path = require("path")

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/site/hello-world.html'));
});

app.listen(8888);