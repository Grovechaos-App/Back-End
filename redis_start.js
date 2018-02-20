'use strict';

const redis = require('redis');
const http = require('http');
const nconf = require('nconf');

// Read in keys and secrets. Using nconf use can set secrets via
// environment variables, command-line arguments, or a keys.json file.
nconf.argv().env().file('keys.json');

// Connect to a redis server provisioned over at
// Redis Labs. See the README for more info.
const client = redis.createClient(
  nconf.get('redisPort') || '6379',
  nconf.get('redisHost') || '127.0.0.1',
  {
    'auth_pass': nconf.get('redisKey'),
    'return_buffers': true
  }
).on('error', (err) => console.error('ERR:REDIS:', err));

// Create a simple little server.
http.createServer((req, res) => {
  client.on('error', (err) => console.log('Error', err));

  // Track every IP that has visited this site
  const listName = 'IPs';
  client.lpush(listName, req.connection.remoteAddress);
  client.ltrim(listName, 0, 25);

  // push out a range
  let iplist = '';
  client.lrange(listName, 0, -1, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);
      return;
    }

    data.forEach((ip) => {
      iplist += `${ip}; `;
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(iplist);
  });
}).listen(process.env.PORT || 8080);

console.log('started web process');