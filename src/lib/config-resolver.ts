import mongodbUri from "mongodb-uri";
import _ from "lodash";

function config() {
  function redisURL(str: string) {
    // URI format: redis://x:942t4dff@192.168.0.17:6379,192.168.0.18:1234
    let urlParts = null;
    try {
      urlParts = mongodbUri.parse(str);
    } catch (e) {
      // parse failed and that is ok.
    }

    if (!_.isObject(urlParts)) {
      return str;
    }

    let hostPort = "localhost:6379"; // Default
    if (_.isArray(urlParts.hosts) && urlParts.hosts.length > 0) {
      const srv = urlParts.hosts[Math.floor(Math.random() * urlParts.hosts.length)];
      hostPort = `${srv.host}:${srv.port}`;
    } else {
      console.log(`Could not determine Redis URL configuration from: ${str}.`);
    }

    return `${urlParts.scheme}://${urlParts.username}:${urlParts.password}@${hostPort}`;
  }

  return {
    redisURL,
  };
}
export default config;
