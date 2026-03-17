const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\/\.local\/.*/,
];

config.server = {
  ...config.server,
  host: "0.0.0.0",
};

module.exports = config;
