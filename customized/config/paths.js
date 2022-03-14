"use strict";

module.exports = ({ env }) => ({
  // uploads directory
  static: `./public/${env("URL_PREFIX", "")}`,
});
