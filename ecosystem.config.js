/**
 * ###################################################
 * #
 * # PM2 Deployment Config
 * #
 * ###################################################
 */

// ###################################################
// # Constants
// ###################################################

const PROJECT_NAME = "howto-strapi";

const deployConfig = {
  SVC_USER: process.env.SVC_USER,
  SVC_SERVER: "127.0.0.1",
  GIT_BRANCH: "origin/master",
  GIT_REPO: __dirname,
  DEST_PATH: `/srv/prod/${PROJECT_NAME}`,
  BUILD_UI: process.env.BUILD_UI || '',
};

const runConfig = { // DO NOT USE variables in *.env*
  instances: 1
};


// ###################################################
// # Commands set
// ###################################################
const postDeployCommon = [
  // PWD: ${prodDir}/source (== WORKING_DIR)
  'git submodule update strapi',
  'yarn install --production --frozen-lockfile',
];
const prod_post_deploy = [ ...postDeployCommon,
  deployConfig.BUILD_UI == 'build-ui' ? 'yarn build:ui' : 'echo Skip Admin UI Build...',
  'pm2 startOrRestart ecosystem.config.js --env production',
];

const dev_post_deploy = [ ...postDeployCommon,
  deployConfig.BUILD_UI == 'build-ui' ? 'yarn build:ui' : 'echo Skip Admin UI Build...',
  'pm2 startOrRestart ecosystem.config.js --env development',
];

const post_setup = [
  // PWD: ${prodDir}/source (== WORKING_DIR)
  'git submodule init strapi',
  'mkdir -p ../shared/logs',
  // make upload directory
  `mkdir -p /srv/static-files/${PROJECT_NAME}/uploads`,
  'ls -al',
];

const deployCommon = {
  user: deployConfig.SVC_USER,
  host: deployConfig.SVC_SERVER,
  ref: deployConfig.GIT_BRANCH,
  repo: deployConfig.GIT_REPO,
  path: deployConfig.DEST_PATH,
  "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
}

// ###################################################
// # EXPORT
// ###################################################

module.exports = {
  apps: [
    {
      name: PROJECT_NAME,
      script: './server.js',
      args: '',
      instances: runConfig.instances,
      exec_mode: "cluster",
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      log_date_format: 'YY-MM-DD HH:mm:ss',    
      error_file: `../shared/logs/error.log`, // $PWD is .../source
      out_file: `../shared/logs/access.log`, // disable: "/dev/null"
    },
  ],

  deploy : {
    production : { ...deployCommon,
      env: {
        NODE_ENV: "production"
      },
      "post-setup": post_setup.join(" && "),
      "post-deploy" : prod_post_deploy.join(" && "),
    },
    development : { ...deployCommon,
      env: {
        NODE_ENV: "development"
      },
      "post-setup": post_setup.join(" && "),
      "post-deploy" : dev_post_deploy.join(" && "),
    }
  },
};
