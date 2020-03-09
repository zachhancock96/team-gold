// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [{
  input: 'modules/add_single_game/add_single_game.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}, {
  input: 'modules/game_view/game_view.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}, {
  input: 'modules/verify_games/verify_games.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}, {
  input: 'modules/file_upload/file_upload.js',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js'
  },
  plugins: [ resolve(), commonjs() ]
}];