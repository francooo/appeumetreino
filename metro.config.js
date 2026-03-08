const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Escutar em todas as interfaces para o Expo Go na rede local conseguir baixar o bundle
config.server = {
  ...config.server,
  host: "0.0.0.0",
};

module.exports = config;
