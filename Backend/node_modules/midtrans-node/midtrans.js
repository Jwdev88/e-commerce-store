var express = require('express');
var router = express.Router();
var encode = require('nodejs-base64-encode');
var https = require('follow-redirects').https;

let requestData;

function setTransaction(vOrderId, vGrossAmount) {
    requestData = '{"transaction_details": {"order_id": "' + vOrderId + '", "gross_amount": ' + vGrossAmount + '}}';
}

router.get('/', function(req, res) {
    accept = 'application/json';
    contentType = 'application/json';
    authString = encode.encode(process.env.MIDTRANS_SERVER_KEY + ':', 'base64');
      
    if(process.env.ENVIRONMENT == 'development') {
        hostName = 'app.sandbox.midtrans.com';
    } else if(process.env.ENVIRONMENT == 'production') {
        hostName = 'app.midtrans.com';
    }

    options = {
        hostname: hostName,
        path: '/snap/v1/transactions',
        method: 'POST',
        headers: {
            'Accept': accept,
            'Content-Type': contentType,
            'Authorization': 'Basic ' + authString,
            'Content-Length': Buffer.byteLength(requestData)
        }
    }
    
    req = https.request(options, (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        response.setEncoding('utf8');
        var body = '';
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            body += chunk;
        });
        
        response.on('end', () => {       
            console.log('No more data in response.')           
            jsonObject = JSON.parse(body);
            res.redirect(jsonObject.redirect_url);
        })  
               
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    req.write(requestData);
    req.end();
});

module.exports = {
    router: router, 
    setTransaction: setTransaction
};