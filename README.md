# TEAM-GOLD


# Front end:

### Getting started:
Install Node and npm. 
(Node 10.x and npm 4.6.0 is preffered. If you dont have these versions and you get an error during npm install, installing these versions are guaranteed to work)

set the working directory of the command line to front_end folder

hit `npm install` (Do this after every git pull.)

hit `npm build` (Do this after every edit to JS modules.)

### Module:

Technically in Javascript lingo, a module is a single JS file which import and/or exports some piece of code from other module. 
Here however, a module is one or more JS files, in `front_end/modules` folder. 
Most modules corresponds to an html page in `front_end/html` directory. 
While there are also other modules example `front_end/modules/shared` module which contains code that is shared across other modules.

A module corresponding to an html page is **bundled** into a single JS file at the time of deployment. 
Bundling in JS lingo, means concatenating a JS file and all its dependencies into one big JS file.
This bundle is outputted into `front_end/out` directory.

Every html has points to exactly one or zero JS file in `front_end/out` directory.

### Adding a new module:

To add a module, say `sweet_potato`, we add this folder in `front_end/modules` directory.

Then we add a file called `sweet_potato.js`. A convention: there has to be atleast one file with the name same as folder name,
and this file is taken to be the **root** of the module. Basically, a JS bundler takes a root file and resolves all its dependencies 
such that the root file and the dependencies form a tree like heirarchy. Later they are concatenated into a singe JS file.

We could also add other files in the module like, `sweet_potato_cooker.js`. Then, `sweet_potato.js` could depend on `sweet_potato_cooker.js` and 
a bundler would bundle them together later.

This example should make it clear:
```javascript
//sweet_potato module
//sweet_potato.js is the root of the module and has dependency on sweet_potato_cooker.js
/*
  File structure

  >front_end
    >modules
      >sweet_potato
        >sweet_potato.js
        >sweet_potato_cooker.js
*/

  //sweet_potato_cooker.js
  export function cook(potato) {
    console.log('Cooking started');
    potato.cook();
    console.log('Cooking ended');
  }

  //sweet_potato.js
  import * as sweet_potato_cooker from './sweet_potato_cooker';
  const potato = {
    heat: function() {
      console.log('I, the potato, am being heated');
    }
  }
  sweet_potato_cooker.cook(potato);
*/
```

### Bundling a module:

To bundle a module you would have to tell the bundler that 'Hey bundler, I would like to bundle this module.' 
Way of doing that is adding an entry to your module in `front_end/rollup.config.js` file.

Say we would like to bundle our `sweet_potato` module, then would make following change to `front_end/rollup.config.js`:
```javascript
//BEFORE YOU ADD sweet_potato MODULE ENTRY:

//rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'modules/add_single_game/add_single_game.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}];

//AFTER YOU ADD sweet_potato MODULE ENTRY:

//rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'modules/add_single_game/add_single_game.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}, {
  input: 'modules/sweet_potato/sweet_potato.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}];
```
Now, type `npm run build` in command line, which would bundle you sweet_potato module into `front_end/out/sweet_potato.js`.

*Note the process described in this section will be automated later*

### Hooking html with module:

Not all modules are linked with html. But say our `sweet_potato` module is.

After `npm run build`, there should be `front_end/out/sweet_potato.js`.

Now add following script tag in `front_end/html/sweet_potato.html`:
```
  <html>
    <head>..</head>
    <body>..</body>
    <script src="../out/sweet_potato.js"></script>
  </html>
```

Voila!


# Some more Joopla adventure:

Joopla runs to his room and yells:

&nbsp; &nbsp; &nbsp; &nbsp;I'm going to run away because I don't want to be here!

&nbsp; &nbsp; &nbsp; &nbsp;You can't make me stay with this cold pudding.

(Meanwhile a faint noise is heard from the bedroom as a window opens)

Joopla turns around and yells Bye mom and I love you!

(Then a thud is heard as he exits out the window)


# Back end:

### Getting started:

Install Node and npm. 
(Node 10.x and npm 4.6.0 is preffered. If you dont have these versions and you get an error during npm install, installing these versions are guaranteed to work)

#### Development:
set the working directory of the command line to backend folder

hit `npm install` (Do this after every git pull.)

hit `npm run tsc` (This runs typescript daemon in watch mode)

go to `dist` subfolder

hit `npx nodemon server.js` (This restarts server whenever any change in dist folder. Typescript dumps js files in dist folder, so making changes to `.ts` files in `src` folder would trigger the server to restart too.)

#### Production (Linux):
set the working directory of the command line to backend folder

hit `npm install` (Do this after every git pull.)

hit `npm start` or `npm start &` to open server as background daemon