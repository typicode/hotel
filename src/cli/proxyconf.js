const sudo = require('sudo')
const conf = require('../conf')
const inquirer = require('inquirer')
const os = require('os')

const options = {
  cachePassword: true,
  prompt: 'Network Configuration requires root privileges. Please enter password:'
}

module.exports = {
  enable,
disable}(function () {
  let platform = os.platform()
  if (platform !== 'darwin') {
    console.log('Feature is currently not supported for your OS')
    process.exit(0)
  }
})()

function chooseNetworkService () {
  return new Promise((resolve) => {
    let child = sudo(['networksetup', '-listallnetworkservices'], options)
    child.stdout.on('data', function (data) {
      let networkServices = data.toString().split('\n').filter(Boolean)
      networkServices.shift()

      let promise = inquirer.prompt([
        {
          type: 'list',
          name: 'network',
          message: 'Choose network service:',
          choices: networkServices
        }
      ])

      promise.then((answer) => {
        resolve(answer['network'])
      })
    })
  })
}

function enable () {
  chooseNetworkService().then((networkService) => {
    let child = sudo(['networksetup', '-setautoproxyurl', networkService, `http://127.0.0.1:${conf.port}/proxy.pac`], options)
    let output = ''

    child.stdout.on('data', function (data) {
      output = data.toString()
    })

    child.on('exit', function () {
      if (output.length > 0) {
        console.log(output)
      } else {
        console.log(`Auto Proxy Configuration has been successfully enabled for ${networkService}`)
      }
    })
  })
}

function disable () {
  chooseNetworkService().then((networkService) => {
    let child = sudo(['networksetup', '-setautoproxystate', networkService, 'off'], options)
    let output = ''

    child.stdout.on('data', function (data) {
      output = data.toString()
    })

    child.on('exit', function () {
      if (output.length > 0) {
        console.log(output)
      } else {
        console.log(`Auto Proxy Configuration has been successfully disabled for ${networkService}`)
      }
    })
  })
}
