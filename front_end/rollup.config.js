// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';

// export default [,{
//   input: 'modules/verify_games/verify_games.js',
//   output: {
//     dir: 'out',
//     format: 'iife',
//     entryFileNames: '[name].js'
//   },
//   plugins: [ resolve(), commonjs(), json() ]
// }, {
//   input: 'modules/file_upload/file_upload.js',
//   output: {
//     dir: 'out',
//     format: 'iife',
//     entryFileNames: '[name].js'
//   },
//   plugins: [ resolve(), commonjs(), json() ]
// }];
export default[
  {
    input: 'modules/add_single_game/add_single_game.js',
    output: {
      dir: 'out',
      format: 'iife',
      entryFileNames: '[name].js'
    },
    plugins: [ resolve(), commonjs(), json() ]
  },{
  input: 'modules/game_view/game_view.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs(), json() ]
},
  {
    input: 'modules/login/login.js',
    output: {
      dir: 'out',
      format: 'iife',
      entryFileNames: '[name].js'
    },
    plugins: [ resolve(), commonjs(), json() ]
  }, {
  input: 'modules/test/test.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs(), json() ]
}];
 