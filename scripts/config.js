import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'

const path = require('path')
// const alias = require('rollup-plugin-alias')
// const cjs = require('rollup-plugin-commonjs')
// const replace = require('rollup-plugin-replace')
const version = process.env.VERSION || require('../package.json').version

const banner =
  '/*!\n' +
  ' * pTopo.js v' + version + '\n' +
  ' * (c) 2018-' + new Date().getFullYear() + ' Point\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]

  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  }
  else {
    return path.resolve(__dirname, '../', p)
  }

}

const builds = {
  // Runtime only (CommonJS). Used by bundlers, e.g. Webpack & Browserify
  'web-runtime-cjs': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.common.js'),
    format: 'cjs',
    banner,
    env: 'development'
  },
  // Runtime+compiler CommonJS build (CommonJS)
  'web-full-cjs': {},
  // Runtime only (ES Modules). Used by bundlers that support ES Modules,
  // e.g. Rollup & Webpack
  'web-runtime-esm': {},
  // Runtime+compiler CommonJS build (ES Modules)
  'web-full-esm': {},
  // runtime-only build (Browser)
  'web-runtime-dev': {},
  // runtime-only production build (Browser)
  'web-runtime-prod': {},
  // Runtime+compiler development build (Browser)
  'web-full-dev': {},
  // Runtime+compiler production build  (Browser)
  'web-full-prod': {},
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      json(),
      babel({
        exclude: 'node_modules/**'
      })
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'pTopo'
    }
  }

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (false) {
  if (process.env.TARGET) {
    module.exports = genConfig(process.env.TARGET)
  } else {
    exports.getBuild = genConfig
    exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
  }
}

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/pTopo.js',
    name: 'pTopo',
    format: 'umd',
    globals: {
      pTopo: '$'
    },
    banner
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}
