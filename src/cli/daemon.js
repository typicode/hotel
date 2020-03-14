const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const startup = require("user-startup");
const common = require("../common");
const conf = require("../conf");
const uninstall = require("../scripts/uninstall");

module.exports = {
  start,
  stop
};

// Start daemon in background
function start() {
  const node = process.execPath;
  const daemonFile = path.join(__dirname, "../daemon");
  const startupFile = startup.getFile("chalet");

  startup.create("chalet", node, [daemonFile], common.logFile);

  // Save startup file path in ~/.chalet
  // Will be used later by uninstall script
  mkdirp.sync(common.chaletDir);
  fs.writeFileSync(common.startupFile, startupFile);

  console.log(`Started http://localhost:${conf.port}`);
}

// Stop daemon
function stop() {
  startup.remove("chalet");
  // kills process and clean stuff in ~/.chalet
  uninstall();
  console.log("Stopped");
}
