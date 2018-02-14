var program = require('commander');
var jobSubmitter = require('./jobsubmitter.js')
var scheduler = require('./scheduler.js')
var jobrunner = require('./jobrunner.js')

program.command('submit <docker-compose> <docker-token> <ip-port>')
.action(function (dockerCompose, dockerToken, ip_port, cmd) {
  console.log("submit", dockerCompose, dockerToken, ip_port)
  jobSubmitter.initialize();
  jobSubmitter.sendJob(dockerCompose, dockerToken, ip_port, function(err) {
    console.log(err);
  });
});

program.command('schedule')
.action(function (cmd) {
  scheduler.initialize();
});

program.command('compute')
.action(function (cmd) {
  jobrunner.initialize();
});

program.command('account')
.action(function (cmd) {
  console.log("account");
});

var args = process.argv;

program.parse(
  args
);
