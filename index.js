'use strict';

function Insta() {
    this.https = require('https');
    this.querystring = require('querystring');
}

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
        protocol: 'https:',
        hostname: 'api.instagram.com',
        port: null,
        path: '/v1/subscriptions/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    let subrequest = this.https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                console.log('No more data in response.');
            });
        });

        subrequest.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    subrequest.write(postData);
    subrequest.end();
};

Insta.prototype.recent = function recent(callback) {
    console.log('---- Recent ----');

    let COUNT = 1;

    let path = '/v1/users/self/media/recent/?' +
        'access_token=' + process.env.ACCESS_TOKEN +
        '&count=' + COUNT;

    let options = {
        protocol: 'https:',
        hostname: 'api.instagram.com',
        port: null,
        path: path,
        method: 'GET',
        headers: {
            'User-Agent': 'Instagram Node Lib 0.0.9',
            'Accept': 'application/json',
            'Content-Length': 0
        }
    };

    let body = '';

    let subrequest = this.https.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        res.setEncoding('utf8');

        res.on('data', getChunk);

        res.on('end', () => {
            console.log('No more data in response.');

            callback(body);
        });
    });

    subrequest.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    subrequest.end();

    function getChunk(chunk) {
        body += chunk;
    }
};

module.exports = Insta;

