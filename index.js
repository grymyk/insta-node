'use strict';

function Insta() {
    this.https = require('https');
    this.querystring = require('querystring');
}

Insta.prototype.DEFAULT = {
    protocol: 'https:',
    hostname: 'api.instagram.com',
    port: null
};

Insta.prototype.GET_HEADERS = {
	method: 'GET',
	headers: {
        'User-Agent': 'Instagram Node Lib 0.0.9',
        'Accept': 'application/json',
        'Content-Length': 0
    }
};

Insta.prototype.responseCallback = function responseCallback(res) {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });

    res.on('end', () => {
        console.log('No more data in response.\n');
    });
};

Insta.prototype.deleteSubscription = function(id) {
    console.log('---- Delete Subscription ---- ');

    let deleteData = {
        client_secret: process.env.CLIENT_SECRET,
        client_id: process.env.CLIENT_ID
    };

    if (id) {
        console.log('Id: %s\n', id);

        deleteData['id'] = id;
    } else {
        deleteData['object'] ='all';
    }

    let payload = this.querystring.stringify(deleteData);

    let options = {
        protocol: 'https:',
        hostname: 'api.instagram.com',
        port: 9200,
        path: '/v1/subscriptions',
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    let subrequest = this.https.request(options, this.responseCallback);

    subrequest.on('error', (e) => {
        console.log(`problem with request: ${e.message}\n`);
    });

    subrequest.write(payload);
    subrequest.end();
};

Insta.prototype.getHandler = function getHandler(path, callback) {
	let options = {};

	options = Object.assign(options, this.DEFAULT);
	options = Object.assign(options, this.GET_HEADERS);

	options.path = path;

	let body = '';

	let subrequest = this.https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        res.setEncoding('utf8');

        res.on('data', getChunk);

        res.on('end', () => {
            console.log('No more data in response.\n');

            callback(body);
        });
    });

    subrequest.on('error', (e) => {
        console.log(`problem with request: ${e.message}\n`);
    });

    subrequest.end();

    function getChunk(chunk) {
        body += chunk;
    }
};

Insta.prototype.checkSubscriptions = function checkSubscriptions(callback) {
	console.log('---- Subscriptions ----');

	callback = callback || console.log;

	let path = '/v1/subscriptions?client_secret=' + process.env.CLIENT_SECRET;
	path += '&client_id=' + process.env.CLIENT_ID;

	this.getHandler(path, callback);
};

Insta.prototype.recent = function recent(count, callback) {
    console.log('---- Recent ----');

    let path = '/v1/users/self/media/recent/?access_token=' + process.env.ACCESS_TOKEN;
	path += '&count=' + count;

	this.getHandler(path, callback);
};

Insta.prototype.subscribe = function subscribe() {
    console.log('---- Subscribe ----');

    let postData = this.querystring.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        object: 'user',
        aspect: 'media',
        verify_token: 'myVerifyToken',
        callback_url: process.env.CALLBACK_URL
    });

    let options = {
        path: '/v1/subscriptions/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    options = Object.assign(options, this.DEFAULT);

    let subrequest = this.https.request(options, this.responseCallback);

    subrequest.on('error', (e) => {
        console.log(`problem with request: ${e.message}\n`);
    });

    subrequest.write(postData);
    subrequest.end();
};

module.exports = new Insta;

