const { spawn } = require('child_process');
const path = require('path');

const services = [
  'auth-service',
  'call-service',
  'match-service',
//   'payment-service',
  'user-service'
];

services.forEach(service => {
  const servicePath = path.join(__dirname, 'services', service);
  const proc = spawn('nodemon', ['server.js'], { cwd: servicePath, stdio: 'inherit' });

  proc.on('close', code => {
    console.log(`${service} exited with code ${code}`);
  });
});
