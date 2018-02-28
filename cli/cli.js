var program = require('commander');
var jobSubmitter = require('./jobsubmitter.js')
var scheduler = require('./scheduler.js')
var jobrunner = require('./jobrunner.js')
const express = require('express')
const app = express()
const os= require('os');
const openport = require('openport');

var chalk = require('chalk');
var figlet = require('figlet');


var logs=[];
var name=null;

app.get('/', function(req, res) {

  const hostName = os.hostname();
  var prettyLogs = "<h2>" + name + " - " + hostName + "</h2>";
  prettyLogs+="<ul>";
  for(var i=0; i<logs.length; i++) {
      prettyLogs+="<li>" + logs[i] + "</li>";
  }
  prettyLogs+="</ul>"

  var output=`
  <html>
    <head><meta http-equiv="refresh" content="10"></head>
    <body>${prettyLogs}</body>
    <script>
      window.scrollTo(0,document.body.scrollHeight);
    </script>
  </html>
  `;
  res.send(output);
})


function log() {
  console.log.apply(null, arguments);
  var args=[];
  for(var i=0; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  logs.push(args.join("\t"));
}

program.command('submit <docker-compose> <docker-token> <ip-port>')
.action(function (dockerCompose, dockerToken, ip_port) {
  //console.log(arguments);
  openport.find(
  {
    startingPort: 3000,
    endingPort: 4000
  },
  function(err, port) {
    if(err) { console.log(err); return; }
    app.listen(port, () => console.log('http server listening on port ' + port));
  }
  );

  name = "Job Submitter";
  log("Initialized");
  jobSubmitter.initialize(log);
  jobSubmitter.sendJob(dockerCompose, dockerToken, ip_port, function(err) {
    console.log(err);
  });
});



program.command('schedule')
.option('-p, --httpport', 'HTTP Port')
.action(function (httpport, cmd) {
  openport.find(
  {
    startingPort: 3000,
    endingPort: 4000
  },
  function(err, port) {
    if(err) { console.log(err); return; }
    app.listen(port, () => console.log('http server listening on port !' + port));
  }
  );

  name = "Scheduler";
  log("Initialized");
  scheduler.initialize(log);
});

program.command('compute')
.action(function (httpport, cmd) {

    openport.find(
    {
      startingPort: 3000,
      endingPort: 4000
    },
    function(err, port) {
      if(err) { console.log(err); return; }
      app.listen(port, () => console.log('Example app listening on port !' + port));
    }
    );

  name = "Compute node";
  log("Initialized");
  jobrunner.initialize(log);
});

program.command('account')
.option('-p, --httpport', 'HTTP Port')
.action(function (httpport, cmd) {

  openport.find(
  {
    startingPort: 3000,
    endingPort: 4000
  },
  function(err, port) {
    if(err) { console.log(err); return; }
    app.listen(port, () => console.log('Example app listening on port !' + port));
  }
  );

  name = "Accountant";
  log("Initialized");
  console.log("account");
});


program.version('0.0.1');
program.description("Compute Coin CLI");

var args = process.argv;

program.parse(
  args
);

if (!program.args.length) {
  console.log(chalk.blue(figlet.textSync('Compute Coin')));
  program.help();
}
