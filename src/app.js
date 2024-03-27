var fs = require('fs');
let express = require('express');
let app = express();
let https = require('https');
let http = require('http');
var jwt = require('jsonwebtoken');
var Gun = require('gun');
var cors = require('cors');
let stream = require('./ws/stream');
let path = require('path');

var config = {};
config.options = {
   key: process.env.SSLKEY ? fs.readFileSync(process.env.SSLKEY) : fs.readFileSync('src/assets/server.key'),
   cert: process.env.SSLCERT ? fs.readFileSync(process.env.SSLCERT) : fs.readFileSync('src/assets/server.cert')
}

config.port = process.env.PORT || 443;
config.gunport = process.env.GUNPORT || 8765;
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(function(req, res, next) {
    if(false){
    // Get the token from the request headers or cookies
    let token = req.headers.cookie.split('jwt=')[1];
    if (token) {
	console.log('token',token);
        // Verify the token
        jwt.verify(token, 'secret', function(err, decoded) {
            if (err) {
                // If verification fails, return an error response
                return res.status(401).json({ error: 'Failed to authenticate token.' });
            } else {
                // If verification succeeds, store the decoded payload in the request object
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // If no token is provided, return an error response
        return res.status(403).json({ error: 'No token provided.' });
    }
}else{next();}
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
    
});

app.get('/:room', function(req, res) {
      res.redirect('/?room=' + req.params.room);
});
if (!process.env.SSL) {
	config.webserver = http.createServer({}, app);
	config.webserver.listen(config.port, () => console.log(`Meething HTTP app listening on port ${config.port}!`))
} else {
	config.webserver = https.createServer(config.options, app);
	config.webserver.listen(config.port, () => console.log(`Meething HTTPS app listening on port ${config.port}!`))
}
