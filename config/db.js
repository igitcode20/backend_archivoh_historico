const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB conectado: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`Error de conexión MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado. Intentando reconexión...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado exitosamente');
    });

    return conn;
  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
