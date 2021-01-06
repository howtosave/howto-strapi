#!/usr/bin/env node
"use strict";

//
// load .env
//
process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config({
  path: require("fs").existsSync(`.env.${process.env.NODE_ENV}.local`)
    ? `.env.${process.env.NODE_ENV}.local`
    : require("fs").existsSync(`.env.${process.env.NODE_ENV}`)
    ? `.env.${process.env.NODE_ENV}` : '.env',
});

//
// start strapi
//
const strapiOpt = {
  dir: process.cwd(),
  autoReload: false,
  serveAdminPanel: process.env.STRAPI_SERVCE_ADMIN_PANEL || true,
};

const strapi = require("strapi")(strapiOpt);
strapi.start();

module.exports = strapi.app;
