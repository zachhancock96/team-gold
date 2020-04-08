import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';

const includePathOptions = {
  include: {
    'shared': 'src/shared/index.js',
    'shared/view': 'src/shared/view/index.js'
  }
};

export default [{
  input: 'src/index.jsx',
  output: {
    dir: 'out',
    format: 'iife',
    entryFileNames: '[name].js',
    sourcemap: true
  },
  plugins: [
    includePaths(includePathOptions),
    resolve({
      jsnext: true,
      extensions: [ '.mjs', '.js', '.jsx', '.json' ]
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
  ]
}];