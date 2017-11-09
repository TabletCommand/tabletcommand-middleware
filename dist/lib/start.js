"use strict";

// cSpell:words nmea

var debug = require("debug")("server-nmea:storage");

var mongooseOnError = function mongooseOnError(err) {
  console.log("Mongoose default connection error: " + err);
  process.exit();
};

var mongooseOnDisconnected = function mongooseOnDisconnected() {
  debug("Mongoose default connection disconnected");
  process.exit();
};

var serverOnError = function serverOnError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error("Port requires elevated privileges");
      break;
    case "EADDRINUSE":
      console.error("Port is already in use");
      break;
    default:
      throw error;
  }
  process.exit(1);
};

var serverOnListening = function serverOnListening(startTime, server) {
  return function onListeningFunc() {
    var address = server.address();
    console.log("Server listening on " + address.address + ":" + address.port + ". Start time: " + (new Date() - startTime) + " ms.");
  };
};

var redisOnError = function redisOnError(err) {
  console.log("Redis connection error: " + err + ".");
  process.exit(1);
};

var redisOnConnect = function redisOnConnect(config, startTime, mongoose, mongooseOnOpen) {
  return function redisOnConnectFunc() {
    console.log("Redis connected after " + (new Date() - startTime) + "ms.");

    mongoose.connect(config.mongoUrl);
    mongoose.connection.on("error", mongooseOnError);
    mongoose.connection.on("disconnected", mongooseOnDisconnected);
    mongoose.connection.on("open", mongooseOnOpen(config, startTime));
  };
};

module.exports = {
  redisOnConnect: redisOnConnect,
  redisOnError: redisOnError,
  serverOnError: serverOnError,
  serverOnListening: serverOnListening
};