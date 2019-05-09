import * as http from 'http'
import { MongooseModule } from "tabletcommand-backend-models";
import { AddressInfo } from 'net';

// cSpell:words nmea
import debugModule from "debug";
const debug = debugModule("server-nmea:storage");

export function mongooseOnError(err: Error) {
  console.log(`Mongoose default connection error: ${err}`);
  process.exit();
};

export function mongooseOnDisconnected() {
  debug("Mongoose default connection disconnected");
  process.exit();
};

export function serverOnError(error: { syscall: string; code: string; }) {
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

export function serverOnListening(startTime: number, server: http.Server) {
  return function onListeningFunc() {
    const address = server.address() as AddressInfo;
    console.log(`Server listening on ${address.address}:${address.port}. Start time: ${(new Date().valueOf() - startTime)} ms.`);
  };
};

export function redisOnError(err: Error) {
  console.log(`Redis connection error: ${err}.`);
  process.exit(1);
};

export function redisOnConnect<T extends { mongoUrl: string }>(config:T, startTime: number, mongoose: MongooseModule, mongooseOnOpen: (cfg: T, startTime: number) => (...a: any[]) => any) {
  return function redisOnConnectFunc() {
    console.log(`Redis connected after ${(new Date().valueOf() - startTime)}ms.`);

    mongoose.connect(config.mongoUrl, {
      useMongoClient: true
    });
    mongoose.connection.on("error", mongooseOnError);
    mongoose.connection.on("disconnected", mongooseOnDisconnected);
    mongoose.connection.on("open", mongooseOnOpen(config, startTime));
  };
};
