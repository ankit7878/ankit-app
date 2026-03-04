const mongoose = require('mongoose');

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://ankit7878:ankit7878@ankit-cluster.q4cy0pl.mongodb.net/?appName=Ankit-Cluster';
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    console.log('MongoDB connected');
  } catch (err) {
    await mongoose.disconnect();
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
