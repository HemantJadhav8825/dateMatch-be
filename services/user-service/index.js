require('dotenv').config();
const connectToMongo = require('./config/db');
const app = require('./app');
const PORT = process.env.PORT || 5002;

connectToMongo((mongoose) => {
  const dbName = mongoose.connection.name;
  app.listen(PORT, () => console.log({ success: `Mongo connected with db = ${dbName} & user-service started on port:${PORT}` }));
}).catch(err => {
  console.error('Mongo connection error:', err);
});
