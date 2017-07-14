const os = require('os')
const sinon = require('sinon')
const tempy = require('tempy')

// Required by AVA, see package.json
sinon.stub(os, 'homedir').returns(tempy.directory())
