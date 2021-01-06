#!/usr/bin/env node
"use strict";

/**
 * Create datababse users
 * 
 * mongo mongodb://myroot:root000@127.0.0.1:27017/ --eval "db.getSiblingDB('strapi').createUser({ user:'strapi', pwd: 'strapi', roles: [{ role:'readWrite', db:'strapi' }] });"
 */

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

const { spawn } = require('child_process');
const ADMIN_USER='myroot';
const ADMIN_PASS='root000';

function onChildProcessExit(child) {
  return new Promise((resolve, reject) => {
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error('Exit with error, ' + code));
    });

    child.once('error', err => {
      reject(err);
    });
  });
}

( async ({env}) => {
  let child;

  // connection test
  try {
    const url = `mongodb://${env.DATABASE_USERNAME}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST||'127.0.0.1'}:${env.DATABASE_PORT||27017}/${env.DATABASE_NAME}`;
    console.log(">>> connection url:", url);
    child = spawn('mongo', [
      url,
      '--eval', `db.getCollectionNames()`
    ], {
      stdio: [process.stdin, process.stdout, process.stderr]
    });
    await onChildProcessExit(child);
    return;
  } catch (e) {
    console.error(e.message);
    console.log(">>> Creating user...");
  } finally {
    if (child && !child.killed) {
      child.kill();
    }
  }

  // create users
  try {
    const url = `mongodb://${ADMIN_USER}:${ADMIN_PASS}@${env.DATABASE_HOST||'127.0.0.1'}:${env.DATABASE_PORT||27017}/`;
    child = spawn('mongo', [
      url,
      '--eval', `db.getSiblingDB('${env.DATABASE_NAME}').createUser({ user:'${env.DATABASE_USERNAME}', pwd: '${env.DATABASE_PASSWORD}', roles: [{ role:'readWrite', db:'${env.DATABASE_NAME}' }] });`
    ], {
      //stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
      stdio: [process.stdin, process.stdout, process.stderr]
    });

    await onChildProcessExit(child);
  } catch (e) {
    console.error(e);
  } finally {
    if (child && !child.killed) {
      child.kill();
    }
  }

})({env:process.env});
