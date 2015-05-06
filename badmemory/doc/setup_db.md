# Database Setup

This document follows the instructions at [Postgres Guide](http://postgresguide.com/). First, [install Postgres](http://postgresguide.com/setup/install.html) using the guide for your specific operating systems. (The authors of the guide have picked the simplest options available, which is the right thing to do for development. For instance, their OS X recommendation is [Postgress.app](), which is pretty much the simplest in the world to manage. It just puts an elephant in your menu bar and you click that to get a menu with options to start/stop the database server, and launch a `psql` console.)

Use `psql` to get an administrator console and [create a user and database](http://postgresguide.com/setup/users.html):

    serhei=# CREATE USER badmemory WITH PASSWORD '<pick a password>';
    serhei=# CREATE DATABASE badmemory_dev;
    serhei=# GRANT ALL PRIVILEGES ON DATABASE badmemory_dev TO badmemory;

Something like this is good enough for our purposes.

Now you need to figure out what port your database is running on (it usually defaults to `5432`), and update `lib/secret_db.js` in our app:

    module.exports = {
      'local': 'postgres://badmemory:<password from earlier>@localhost:5432/badmemory_dev'
    };

## Graphical Apps to See Database Contents

To test out what your program is doing, it's nice to have a graphical client that shows the contents of your database, rather than having to manually run queries using `psql`. `pgAdmin` is a commonly used one, but bad for connecting to Heroku because the dropdown will make you scroll through the jillion other Heroku databases running on the same Amazon EC2. (You can't connect to any of them, obviously, they just clutter up your navigation.)

The page at https://wiki.postgresql.org/wiki/Community_Guide_to_PostgreSQL_GUI_Tools has a comprehensive list of graphical clients. I ended up going with a free trial of [PG Commander](https://eggerapps.at/pgcommander/) on my Mac.

## Understanding Sequelize

Sequelize is an Object/Relational Mapping (ORM) library that eliminates the need for Node users to build raw SQL queries to manage their database. It provides a way to define the format of the objects stored in the database (a model), as well as functionality to copy data to and from the database. A quick tutorial for Sequelize can be found [here](http://sequelizejs.com/articles/getting-started); in particular, it explains the basics of building / saving / retrieving objects, and is therefore well worth reading.

The Sequelize models are defined in the directory `models/`. `models/index.js` creates the overall model (it gets included in `app.js` by requiring `model`) while `models/user.js` (or similar) actually calls things like `sequelize.define()` to assemble the information about the relevant table. Full documentation on defining models is available at http://sequelizejs.com/docs/1.7.8/models.

<!-- TODOXXX further info on sequelize -->

## Understanding Sequelize Migrations

(*These notes are a work in progress.*)

**You don't need to do this unless you want to administer either your own local copy of the database, or our shared Heroku database.**

Sequelize comes with a command-line utility for safely applying migrations (that needs to be installed for systemwide access, as shown below). A migration is a set of database operations that change the schema, along with a corresponding description of how to _undo_ the change. They are defined in the `migrations/` folder of the project.

One way to employ migrations is via the `sequelize` CLI utility. You'll need to install it for systemwide access as follows:

    # npm install --global sequelize-cli

Full documentation is available at http://sequelizejs.com/docs/1.7.8/migrations. Create a skeleton config file:

    $ sequelize init:config

This creates `config/config.json`, which you'll need to manually fill in with data for your database connections, as copied from `lib/secret_db.js` (the utility doesn't read either of our `secret_db` formats, whether the current one or the one Kevin was using). **Don't** bother running `sequelize init` or `sequelize init:models` since those will just try to overwrite `models/index.js`.

<!-- TODOXXX some sample migrations corresponding to the changes we make -->

# Some Other Links

Kevin found these useful in his Postgres setup:
- http://russbrooks.com/2010/11/25/install-postgresql-9-on-os-x
- http://www.postgresql.org/docs/9.0/static/sql-createdatabase.html
- http://www.postgresql.org/docs/9.3/interactive/app-pg-ctl.html
- https://github.com/brianc/node-postgres
- To run scripts, use `\i scriptname` at the `psql` prompt.

User setup:
- http://www.postgresql.org/docs/8.0/static/sql-createuser.html
- http://www.postgresql.org/docs/8.0/static/sql-alteruser.html

Starting, shutting down, and changing ports:
- http://stackoverflow.com/questions/187438/want-to-change-pgsql-port
- http://stackoverflow.com/questions/6950395/postgresql-server-wouldnt-shutdown-on-lion-mac-os-10-7

Serhei's original attempt to set up was on Fedora Linux according to this wiki:
- https://fedoraproject.org/wiki/PostgreSQL
- it was also necessary to install `postgresql-devel` before running `npm install pg`

Nginx Setup
Please follow instructions from https://gist.github.com/soheilhy/8b94347ff8336d971ad0
and use the conf file that I pushed
also, please copy the key key and certificate to the same folder as your nginx (where the conf file is stored)
so there are two ways to get to the site
https://localhost:3000
http://localhost:2000
