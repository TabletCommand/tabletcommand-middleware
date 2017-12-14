"use strict";

const bunyan = require("bunyan");

const logger = function loggerFunc(name, filePath, logToConsole) {
  let streams = [];

  if (logToConsole) {
    streams.push({
      level: "info",
      stream: process.stdout
    });
  }

  streams.push({
    type: "rotating-file",
    path: filePath,
    period: "1d", // daily rotation
    count: 10 // keep 3 back copies
  });

  const logger = bunyan.createLogger({
    name: name,
    streams: streams
  });

  // Reopen file streams on signal
  process.on("SIGUSR2", function() {
    logger.reopenFileStreams();
  });

  return logger;
};

module.exports = {
  logger: logger
};
