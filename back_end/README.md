# TEAM-GOLD

## Server side

### Getting started:
Install Node and npm. 
(Node 10.x and npm 4.6.0 is preffered. If you dont have these versions and you get an error during npm install, installing these versions are guaranteed to work)

### Seeding database (Linux):
It assumes that the path to mysql executable is available in environment variable.
To check if it is available, just type `mysql` in your bash.

Make sure you have `.env` file at `backend/sql_seed` folder, and that it has all the key value pairs as shown in `backend/sql_seed/.env.example` file.

hit `sudo npm run seed`

Note that it erases all the data before seeding.

### Running server (Linux):
Make sure you have `.env` file at the root of the backend folder, and that it has all the key value pairs as shown in .env.example file.

set the working directory of the command line to backend folder

hit `sudo npm install` (Do this after every git pull.)

hit `sudo npm start` or `sudo npm start &` to open server as background daemon

#### Some errors that might crop up, and how to debug:
1. If `Error: listen EADDRINUSE: address already in use` error, then it means
that server is already running in that case close the node process by doing `sudo kill -9 <pid>`. (You can see process Ids of all active node process by doing `sudo ps -ef | grep node`)

2. If `error TS5033: Could not write file ....` error, then you forgot `sudo` before
`sudo npm start`