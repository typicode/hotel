const fs = require('fs')
const express = require('express')

const conf = require('../../../raw-conf')
const { confFile } = require('../../../common')

module.exports = group => {
  const router = express.Router()

  router.get('/', (req, res) => {
    res.json(conf)
  })
  router.post('/', (req, res) => {
    fs.writeFileSync(confFile, JSON.stringify(req.body, null, 2))
  })

  return router
}
