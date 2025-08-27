require('dotenv').config();
const connectToMongo = require('./config/db');
const app = require('./app');
const PORT = process.env.PORT;

connectToMongo(async(mongoose) => {
  // // ------------------------------------------------------
  // const User = mongoose.connection.models['User'];
  // if (!User) {
  //   throw new Error('User model not found in mongoose connection');
  // }

  // const result = await User.deleteMany({});
  // console.log(`Deleted ${result.deletedCount} users`);
  // // ------------------------------------------------------

  const dbName = mongoose.connection.name;
  app.listen(PORT, () => console.log({ success: `Mongo connected with db = ${dbName} & auth-service started on port:${PORT}` }));
}).catch(err => {
  console.error('Mongo connection error:', err);
});

