# midtrans-node

Midtrans SNAP (Web View) API nodejs

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
npm install nodejs-base64-encode --save
npm install midtrans-node --save
npm install follow-redirects --save
```

### Installing

A step by step for running midtrans snap API

Open your default server entry point example (app.js) and add this code below in the top require module:

```
var midtrans = require('midtrans-node');
```
Add parameter order id and amount example (app.js):

```
midtrans.setTransaction("Test1", 100000);
```

And add router from module like this in example (app.js):

```
app.use('/api/midtrans', midtrans.router);
```

Set your key and environment ('development' / 'production') make sure your key is for development (sandbox) or production in midtrans dashboard. Use this example code with your credentials (app.js):

```
process.env.MIDTRANS_SERVER_KEY = 'Your Server Key';
process.env.ENVIRONMENT = 'development';
```

## Running the tests

To test it, send GET request to this url:

example: localhost:8080/api/midtrans/

### Break down into end to end tests

Response will redirect to midtrans page.

## Deployment

After installing packages and setting up environment and parameters, you can start using midtrans.
Note:
Declare 
```
midtrans.setTransaction(orderId, priceAmount);
```
first in your controller then call API [GET] example: localhost:8080/api/midtrans/


## Authors

* **Faisal** - *Github* - [vai21](https://github.com/vai21)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

Donate me a cup of coffee https://www.paypal.me/faisalrasid