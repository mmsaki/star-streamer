var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.render('index.ejs');
});

app.listen(3000, () => {
	console.log(`server started on http://localhost:3000`);
});
