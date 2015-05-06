# For the instructor

We have included our Heroku key in lib/secret_db.js; that contains the connection string for our temporary test database. For example, login as username 'serhei', password 'testtesttest'.

The instructions below describe our nginx setup. If you do not want to bother setting up nginx, run the app and visit localhost:4000.

# Install Instructions

Get [node](http://nodejs.org/). This includes the `npm` package manager.

In this directory, run `npm install`. This will pull down necessary helper modules and put them in a subdirectory called `node_modules`. (Do not commit `node_modules` to git; everyone should do their own install.)

To enable nginx, please copy the nginx conf file in badmemory/lib and replace the default nginx file. Also, copy lib/cert.pem and lib/key.pem into the same folder where nginx.conf is located. That is required for SSL.

You can then launch the server using `npm start`. Visit `localhost:2000` to view the resulting webpage.
Please accept the certificates if you get any warnings (we generated the key/certificate on the local machine)

NOTE: if you are not running nginx, visit https://localhost:4000 OR https://localhost:4001 OR https://localhost:4002
We created 3 server instances to simulate load balancing. Please use the https protocol as all http->https redirecting is done on nginx.

