import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/js/blogger.js',
    format: 'umd',
    name: 'BloggerJS'
  },
  plugins: [
    commonjs(),
    babel({
      babelHelpers: 'bundled'
    })
  ]
}
