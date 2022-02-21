require('@adonisjs/assembler/build/register')
require('reflect-metadata')

const { configure } = require('japa')
configure({
  files: ['test/**/*.spec.ts'],
})
