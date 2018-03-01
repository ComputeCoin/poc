var program = require('commander');
var jobSubmitter = require('./jobsubmitter.js')
var scheduler = require('./scheduler.js')
var jobrunner = require('./jobrunner.js')
<<<<<<< HEAD
var accountant = require('./accountant.js');
var walletManager = require("./wallet.js")
const express = require('express')
const app = express();
=======
const express = require('express')
const app = express()
>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
const os= require('os');
const openport = require('openport');

var chalk = require('chalk');
var figlet = require('figlet');

<<<<<<< HEAD
app.use(express.static('public'))

var logs=[];
var accountantLogs=[];
var schedulerLogs=[];
var name=null;
var jobs = [];
var computeNodes=[];


app.get("/logs", function(req, res){
    const hostName = os.hostname();
    var prettyLogs = "<h2>" + name + " - " + hostName + "</h2>";
    prettyLogs+="<ul>";
    for(var i=0; i<logs.length; i++) {
        prettyLogs+="<li>" + logs[i] + "</li>";
    }
    prettyLogs+="</ul>"

    var output=`<html>
      <head><meta http-equiv="refresh" content="10"></head>
      <body>${prettyLogs}</body>
      <script>
        window.scrollTo(0,document.body.scrollHeight);
      </script>
    </html>`;

    res.send(output);
});

app.post('/submitJob', function(req, res) {
  var params = {
    "docker_compose": "./docker-compose.yml",
    "docker_swarm_token": "SWMTKN-1-2i8tdmx0p8onoxo1ugg6yxx00o8t15o7hi45d2xwhm9qqyh0b5-dfncsiceaaw0g0vxzc57zre1p",
    "docker_swarm_ipport": "192.168.99.101:2377",
    "name": "Deep Learning 1"
  };
  jobSubmitter.sendJob(params.name, params.docker_compose, params.docker_swarm_token, params.docker_swarm_ipport, function(err, job) {
    console.log(job);
    //console.log(err);
    console.log("sending response");
    res.send(JSON.stringify(job));
  });

});


app.post('/launchSchedulerNode', function(req, res) {
  scheduler.initialize(log, walletManager);
  res.send(JSON.stringify(scheduler.getScheduler()));
});

app.post('/launchAccountantNode', function(req, res) {
  accountant.initialize(log, walletManager);
  res.send(JSON.stringify(accountant.getAccountant()));
});

app.post('/launchComputeNode', function(req, res) {
  jobrunner.initialize(log, walletManager);
  res.send(JSON.stringify(jobrunner.getBid()));
});



app.get('/jobs', function(req, res){
  var jobs = jobSubmitter.getJobs();
  res.send(JSON.stringify(jobs));
});

app.get('/status', function(req,res){
  var status= {
    "jobs": jobSubmitter.getJobs(),
    "computeNode": jobrunner.getBid(),
    "scheduler": scheduler.getScheduler(),
    "accountant": accountant.getAccountant(),
    "wallet": walletManager.getWallet()
  }
  res.send(JSON.stringify(status));
});

app.get('/accountant/logs', function(req, res) {

});

app.get('/scheduler/logs', function(req, res) {

})

=======

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


>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
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
<<<<<<< HEAD
=======
  //console.log(arguments);
>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
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
<<<<<<< HEAD
=======
.option('-p, --httpport', 'HTTP Port')
>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
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
<<<<<<< HEAD
=======
.option('-p, --httpport', 'HTTP Port')
>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
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


<<<<<<< HEAD

program.command('web')
.action(function (httpport, cmd) {
  walletManager.initialize(log, "0x7df9a875a174b3bc565e6424a0050ebc1b2d1d82");

  openport.find(
  {
    startingPort: 3000,
    endingPort: 4000
  },
  function(err, port) {
    if(err) { console.log(err); return; }
    app.listen(port, () => console.log('Example app listening on port !' + port));
    setTimeout(function() {
      jobSubmitter.initialize(log, walletManager);
    },1000);

  }
  );

});


=======
>>>>>>> 8fe2556e602df6b470f75ff5f73f347abe126c5e
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
