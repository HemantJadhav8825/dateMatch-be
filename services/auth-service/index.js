require('dotenv').config();
const connectToMongo = require('./config/db');
const app = require('./app');
const PORT = process.env.PORT;

connectToMongo((mongoose) => {
  const dbName = mongoose.connection.name;
  app.listen(PORT, () => console.log({ success: `Mongo connected with db = ${dbName} & auth-service started on port:${PORT}` }));
}).catch(err => {
  console.error('Mongo connection error:', err);
});

