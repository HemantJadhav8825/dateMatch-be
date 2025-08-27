require('dotenv').config();
const http = require('http');
const connectToMongo = require('./config/db');
const app = require('./app');
const { initSockets } = require('./services/socketService');

const PORT = process.env.PORT || 5004;

const server = http.createServer(app);
initSockets(server); // initialize socket.io namespaces

connectToMongo((mongoose) => {
  const dbName = mongoose.connection.name;
  server.listen(PORT, () => {
    console.log({ success: `Mongo connected with db = ${dbName} & call-service started on port:${PORT}` })
  });
}).catch(err => {
  console.error('Mongo connection error:', err);
});
