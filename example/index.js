const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/video', function (req, res) {
	const range = req.headers.range;
});

app.listen(8000, function () {
	console.log('listening on port 8000!');
});
