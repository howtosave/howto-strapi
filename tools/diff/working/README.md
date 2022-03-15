# HowTo Strapi V3

Mono-Repo for Strapi V3 Project

## strapi packages to be built after modification

After modification below packages, you should run `build` command.
Dependency packages installation is necessary to `build` the packages.

N.B.
You may remove the dependency packages under `node_modules` after building the modified packages.
You may got some errors when you run an application without removing the dependency packages under the `strapi` directory.

- strapi-helper-plugin
  - go to `strapi/packages/strapi-helper-plugin`
  - run `yarn build`
- to remove all `node_modules` directories under `./strapi`
  - run `find ./strapi -type d -name node_modules | xargs rm -rf`

## Merging with new strapi version

```sh
cd ./strapi
# fetch new version from strapi
git fetch -q strapi v3.6.1
git co FETCH_HEAD
# create new branch for the new version
git co -b v3.6.1

# create new branch for my version from the prev version, my3.6.0
git co my3.6.0
git co -b my3.6.1

```

## Trouble-shooting

### when the admin console does not work

When you got an error like this: 

```Uncaught TypeError: Cannot read properties of undefined (reading 'toggleNotification')```

아래 예시처럼 `./strapi` 디렉토리 아래 모든 `node_modules` 디렉토리를 삭제 후 재시도 한다.

```sh
# go to strapi directory
cd ./strapi
# remove dependency packages for strapi
find . -name node_modules -type d | xargs rm -rf
# go to project root directory
cd ../getstarted
# install dependency packages
yarn install
# build admin
yarn build
# start dev server and browse admin console
yarn dev
```

### when you meet "sharp" module installation issue on M1 Mac

When you got an error like this: 

```txt
Something went wrong installing the "sharp" module

Cannot find module '../build/Release/sharp-darwin-arm64v8.node'
Require stack:
- .../node_modules/sharp/lib/sharp.js
- .../node_modules/sharp/lib/constructor.js
...
```

아래 예시처럼 기 설치된 `sharp` package를 삭제/재설치 후 재시도 한다.

```sh
rm -rf ../node_modules/sharp
yarn install --check-files
```

### upload path

```diff
diff --git a/packages/strapi-plugin-upload/middlewares/upload/index.js b/packages/strapi-plugin-upload/middlewares/upload/index.js
index d37aa9191..ef833375c 100644
--- a/packages/strapi-plugin-upload/middlewares/upload/index.js
+++ b/packages/strapi-plugin-upload/middlewares/upload/index.js
@@ -7,9 +7,10 @@ const _ = require('lodash');
 
 module.exports = strapi => ({
   initialize() {
+    // [PK] fix overriding upload directory issue
     const configPublicPath = strapi.config.get(
-      'middleware.settings.public.path',
-      strapi.config.paths.static
+      'paths.static',
+      strapi.config.middleware.settings.public.path
     );
     const staticDir = resolve(strapi.dir, configPublicPath);
 
diff --git a/packages/strapi-provider-upload-local/lib/index.js b/packages/strapi-provider-upload-local/lib/index.js
index 9997cea1a..e896d925b 100644
--- a/packages/strapi-provider-upload-local/lib/index.js
+++ b/packages/strapi-provider-upload-local/lib/index.js
@@ -17,8 +17,9 @@ module.exports = {
       }
     };
     const configPublicPath = strapi.config.get(
-      'middleware.settings.public.path',
-      strapi.config.paths.static
+      // [PK] fix URL_PREFIX issue for upload
+      'paths.static',
+      strapi.config.middleware.settings.public.path
     );
 
     const uploadDir = path.resolve(strapi.dir, configPublicPath);

```

### Override auth

```diff
diff --git a/packages/strapi-plugin-users-permissions/config/functions/bootstrap.js b/packages/strapi-plugin-users-permissions/config/functions/bootstrap.js
index 6881b35e4..84862b7b0 100644
--- a/packages/strapi-plugin-users-permissions/config/functions/bootstrap.js
+++ b/packages/strapi-plugin-users-permissions/config/functions/bootstrap.js
@@ -139,6 +139,15 @@ module.exports = async () => {
       scope: ['openid email'], // scopes should be space delimited
       subdomain: 'my.subdomain.com/cas',
     },
+    // [PK] add apple sign in
+    apple: {
+      enabled: false,
+      icon: 'apple',
+      key: '',
+      secret: '',
+      callback: `${strapi.config.server.url}/auth/apple/callback`,
+      scope: ['name email'],
+    },
   };
   const prevGrantConfig = (await pluginStore.get({ key: 'grant' })) || {};
   // store grant auth config to db

diff --git a/packages/strapi-plugin-users-permissions/services/Providers.js b/packages/strapi-plugin-users-permissions/services/Providers.js
index 8b5a2d457..31a909887 100644
--- a/packages/strapi-plugin-users-permissions/services/Providers.js
+++ b/packages/strapi-plugin-users-permissions/services/Providers.js
@@ -14,6 +14,31 @@ const purestConfig = require('@purest/providers');
 const { getAbsoluteServerUrl } = require('strapi-utils');
 const jwt = require('jsonwebtoken');
 
+// [PK] parse id_token for apple sign in
+function base64urlUnescape(str) {
+  str += new Array(5 - (str.length % 4)).join('=');
+  return str.replace(/\-/g, '+').replace(/_/g, '/');
+}
+function unescapeAppleIdToken(idToken, cb) {
+  // Jwt format: header . body . signature
+  var segments = idToken.split('.');
+  if (segments.length > 3) return cb(new Error('Jwt cannot be parsed'));
+  try {
+    // parse body only
+    const body = JSON.parse(Buffer.from(base64urlUnescape(segments[1]), 'base64'));
+    if (new Date(body.exp * 1000) < new Date()) {
+      return cb(new Error('Jwt is expired'));
+    }
+  
+    cb(null, {
+      username: body.email.split('@')[0],
+      email: body.email,
+    });
+  } catch (e) {
+    return cb(e);
+  }
+}
+  
 /**
  * Connect thanks to a third-party provider.
  *
@@ -581,6 +606,15 @@ const getProfile = async (provider, query, callback) => {
         });
       break;
     }
+
+    // [PK] add apple sign in
+    // See https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
+    case 'apple': {
+      const { id_token } = query;
+      unescapeAppleIdToken(id_token, callback);
+      break;
+    }
+    
     default:
       callback(new Error('Unknown provider.'));
       break;

diff --git a/packages/strapi-plugin-users-permissions/controllers/Auth.js b/packages/strapi-plugin-users-permissions/controllers/Auth.js
index 3b6b5115a..81213f4f0 100644
--- a/packages/strapi-plugin-users-permissions/controllers/Auth.js
+++ b/packages/strapi-plugin-users-permissions/controllers/Auth.js
@@ -249,10 +249,14 @@ module.exports = {
       .get();
 
     const [requestPath] = ctx.request.url.split('?');
-    const provider = requestPath.split('/')[2];
+    // [PK] if we have a prefix url, the provider value position in the url is [3]
+    // /connect/:provider/... or /prefix/connect/:provider/...
+    const paths = requestPath.split('/');
+    const grantPrefix = `${paths[2] === 'connect' ? '/' + paths[1] : ''}/connect`;
+    const provider = paths[2] === 'connect' ? paths[3] : paths[2];
 
     if (!_.get(grantConfig[provider], 'enabled')) {
-      return ctx.badRequest(null, 'This provider is disabled.');
+      return ctx.badRequest(null, provider + ' is disabled.');
     }
 
     if (!strapi.config.server.url.startsWith('http')) {
@@ -266,7 +270,8 @@ module.exports = {
     grantConfig[provider].redirect_uri = strapi.plugins[
       'users-permissions'
     ].services.providers.buildRedirectUri(provider);
-
+    grantConfig['defaults'] = { prefix: grantPrefix };
+      
     return grant(grantConfig)(ctx, next);
   },

```

### Admin

```diff
diff --git a/packages/strapi-admin/admin/src/components/LeftMenu/LeftMenuFooter/index.js b/packages/strapi-admin/admin/src/components/LeftMenu/LeftMenuFooter/index.js
index cd5748456..7997ec827 100644
--- a/packages/strapi-admin/admin/src/components/LeftMenu/LeftMenuFooter/index.js
+++ b/packages/strapi-admin/admin/src/components/LeftMenu/LeftMenuFooter/index.js
@@ -6,32 +6,15 @@
 
 import React from 'react';
 import { PropTypes } from 'prop-types';
-import Wrapper, { A } from './Wrapper';
+import Wrapper from './Wrapper';
 
 function LeftMenuFooter({ version }) {
-  // PROJECT_TYPE is an env variable defined in the webpack config
-  // eslint-disable-next-line no-undef
-  const projectType = PROJECT_TYPE;
+  // [PK] display version only
 
   return (
     <Wrapper>
       <div className="poweredBy">
-        <A key="website" href="https://strapi.io" target="_blank" rel="noopener noreferrer">
-          Strapi
-        </A>
-        &nbsp;
-        <A
-          href={`https://github.com/strapi/strapi/releases/tag/v${version}`}
-          key="github"
-          target="_blank"
-          rel="noopener noreferrer"
-        >
-          v{version}
-        </A>
-        &nbsp;
-        <A href="https://strapi.io" target="_blank" rel="noopener noreferrer">
-          — {projectType} Edition
-        </A>
+        v{version}
       </div>
     </Wrapper>
   );
diff --git a/packages/strapi-admin/admin/src/containers/Admin/index.js b/packages/strapi-admin/admin/src/containers/Admin/index.js
index f8cf12f9e..ab961892f 100644
--- a/packages/strapi-admin/admin/src/containers/Admin/index.js
+++ b/packages/strapi-admin/admin/src/containers/Admin/index.js
@@ -85,23 +85,7 @@ export class Admin extends React.Component {
   }
 
   emitEvent = async (event, properties) => {
-    const {
-      global: { uuid },
-    } = this.props;
-
-    if (uuid) {
-      try {
-        await axios.post('https://analytics.strapi.io/track', {
-          event,
-          // PROJECT_TYPE is an env variable defined in the webpack config
-          // eslint-disable-next-line no-undef
-          properties: { ...properties, projectType: PROJECT_TYPE },
-          uuid,
-        });
-      } catch (err) {
-        // Silent
-      }
-    }
+    // [PK] removed telemetry
   };
 
   fetchAppInfo = async () => {
@@ -115,48 +99,7 @@ export class Admin extends React.Component {
     }
   };
 
-  fetchStrapiLatestRelease = async () => {
-    const {
-      global: { strapiVersion },
-      getStrapiLatestReleaseSucceeded,
-    } = this.props;
-
-    if (!STRAPI_UPDATE_NOTIF) {
-      return;
-    }
-
-    try {
-      const {
-        data: { tag_name },
-      } = await axios.get('https://api.github.com/repos/strapi/strapi/releases/latest');
-      const shouldUpdateStrapi = checkLatestStrapiVersion(strapiVersion, tag_name);
-
-      getStrapiLatestReleaseSucceeded(tag_name, shouldUpdateStrapi);
-
-      const showUpdateNotif = !JSON.parse(localStorage.getItem('STRAPI_UPDATE_NOTIF'));
-
-      if (!showUpdateNotif) {
-        return;
-      }
-
-      if (shouldUpdateStrapi) {
-        strapi.notification.toggle({
-          type: 'info',
-          message: { id: 'notification.version.update.message' },
-          link: {
-            url: `https://github.com/strapi/strapi/releases/tag/${tag_name}`,
-            label: {
-              id: 'notification.version.update.link',
-            },
-          },
-          blockTransition: true,
-          onClose: () => localStorage.setItem('STRAPI_UPDATE_NOTIF', true),
-        });
-      }
-    } catch (err) {
-      // Silent
-    }
-  };
+  // [PTK] removed useless code
 
   hasApluginNotReady = props => {
     const {
@@ -168,7 +111,7 @@ export class Admin extends React.Component {
 
   initApp = async () => {
     await this.fetchAppInfo();
-    await this.fetchStrapiLatestRelease();
+    // [PTK] removed useless code
   };
 
   /**
diff --git a/packages/strapi-admin/admin/src/containers/App/index.js b/packages/strapi-admin/admin/src/containers/App/index.js
index 37c5bd381..c4995ba06 100644
--- a/packages/strapi-admin/admin/src/containers/App/index.js
+++ b/packages/strapi-admin/admin/src/containers/App/index.js
@@ -76,27 +76,7 @@ function App(props) {
       try {
         const { data } = await request('/admin/init', { method: 'GET' });
 
-        const { uuid } = data;
-
-        if (uuid) {
-          try {
-            const deviceId = await getUID();
-
-            fetch('https://analytics.strapi.io/track', {
-              method: 'POST',
-              body: JSON.stringify({
-                event: 'didInitializeAdministration',
-                uuid,
-                deviceId,
-              }),
-              headers: {
-                'Content-Type': 'application/json',
-              },
-            });
-          } catch (e) {
-            // Silent.
-          }
-        }
+        // [PK] removed telemetry
 
         getDataRef.current(data);
         setState({ isLoading: false, hasAdmin: data.hasAdmin });
diff --git a/packages/strapi-admin/admin/src/containers/ApplicationInfosPage/index.js b/packages/strapi-admin/admin/src/containers/ApplicationInfosPage/index.js
index e46bceced..11775abae 100644
--- a/packages/strapi-admin/admin/src/containers/ApplicationInfosPage/index.js
+++ b/packages/strapi-admin/admin/src/containers/ApplicationInfosPage/index.js
@@ -8,28 +8,17 @@ import { BaselineAlignment } from 'strapi-helper-plugin';
 import Bloc from '../../components/Bloc';
 import PageTitle from '../../components/SettingsPageTitle';
 import makeSelectApp from '../App/selectors';
-import makeSelectAdmin from '../Admin/selectors';
+// [PK] customize app-info page
 import { Detail, InfoText } from './components';
 
 const makeSelectAppInfos = () => createSelector(makeSelectApp(), appState => appState.appInfos);
-const makeSelectLatestRelease = () =>
-  createSelector(makeSelectAdmin(), adminState => ({
-    latestStrapiReleaseTag: adminState.latestStrapiReleaseTag,
-    shouldUpdateStrapi: adminState.shouldUpdateStrapi,
-  }));
+
+// [PK] customize app-info page
 
 const ApplicationInfosPage = () => {
   const { formatMessage } = useIntl();
   const selectAppInfos = useMemo(makeSelectAppInfos, []);
-  const selectLatestRealase = useMemo(makeSelectLatestRelease, []);
   const appInfos = useSelector(state => selectAppInfos(state));
-  const { shouldUpdateStrapi, latestStrapiReleaseTag } = useSelector(state =>
-    selectLatestRealase(state)
-  );
-
-  const currentPlan = appInfos.communityEdition
-    ? 'app.components.UpgradePlanModal.text-ce'
-    : 'app.components.UpgradePlanModal.text-ee';
 
   const headerProps = {
     title: { label: formatMessage({ id: 'Settings.application.title' }) },
@@ -37,20 +26,7 @@ const ApplicationInfosPage = () => {
       id: 'Settings.application.description',
     }),
   };
-  const pricingLabel = formatMessage({ id: 'Settings.application.link-pricing' });
-  const upgradeLabel = formatMessage({ id: 'Settings.application.link-upgrade' });
-  const strapiVersion = formatMessage({ id: 'Settings.application.strapi-version' });
   const nodeVersion = formatMessage({ id: 'Settings.application.node-version' });
-  const editionTitle = formatMessage({ id: 'Settings.application.edition-title' });
-
-  /* eslint-disable indent */
-  const upgradeLink = shouldUpdateStrapi
-    ? {
-        label: upgradeLabel,
-        href: `https://github.com/strapi/strapi/releases/tag/${latestStrapiReleaseTag}`,
-      }
-    : null;
-  /* eslint-enable indent */
 
   return (
     <div>
@@ -60,18 +36,24 @@ const ApplicationInfosPage = () => {
       <Bloc>
         <Padded left right top size="smd">
           <Padded left right top size="xs">
-            <Flex justifyContent="space-between">
-              <Detail
-                link={upgradeLink}
-                title={strapiVersion}
-                content={`v${appInfos.strapiVersion}`}
-              />
-              <Detail
-                link={{ label: pricingLabel, href: 'https://strapi.io/pricing' }}
-                title={editionTitle}
-                content={formatMessage({ id: currentPlan })}
-              />
-            </Flex>
+            <Padded top size="lg">
+              <Text fontSize="xs" color="grey" fontWeight="bold">
+                App Package Name
+              </Text>
+              <InfoText content={appInfos.appPackageName} />
+            </Padded>
+            <Padded top size="lg">
+              <Text fontSize="xs" color="grey" fontWeight="bold">
+                App Package Version
+              </Text>
+              <InfoText content={appInfos.appPackageVersion} />
+            </Padded>
+            <Padded top size="lg">
+              <Text fontSize="xs" color="grey" fontWeight="bold">
+                Environment
+              </Text>
+              <InfoText content={appInfos.currentEnvironment} />
+            </Padded>
             <Padded top size="lg">
               <Text fontSize="xs" color="grey" fontWeight="bold">
                 {nodeVersion}
diff --git a/packages/strapi-admin/admin/src/containers/AuthPage/index.js b/packages/strapi-admin/admin/src/containers/AuthPage/index.js
index a8a7c0932..b8bc65b45 100644
--- a/packages/strapi-admin/admin/src/containers/AuthPage/index.js
+++ b/packages/strapi-admin/admin/src/containers/AuthPage/index.js
@@ -213,19 +213,8 @@ const AuthPage = ({ hasAdmin, setHasAdmin }) => {
       auth.setToken(token, false);
       auth.setUserInfo(user, false);
 
-      if (
-        (authType === 'register' && modifiedData.userInfo.news === true) ||
-        (authType === 'register-admin' && modifiedData.news === true)
-      ) {
-        axios({
-          method: 'POST',
-          url: 'https://analytics.strapi.io/register',
-          data: {
-            email: user.email,
-            username: user.firstname,
-          },
-        });
-      }
+      // [PK] removed telemetry
+
       // Redirect to the homePage
       setHasAdmin(true);
       push('/');
diff --git a/packages/strapi-admin/admin/src/containers/Onboarding/index.js b/packages/strapi-admin/admin/src/containers/Onboarding/index.js
index 25cc59b21..8d3969e62 100644
--- a/packages/strapi-admin/admin/src/containers/Onboarding/index.js
+++ b/packages/strapi-admin/admin/src/containers/Onboarding/index.js
@@ -19,29 +19,10 @@ const OnboardingVideos = () => {
   const [reducerState, dispatch] = useReducer(reducer, initialState, init);
   const { isLoading, isOpen, videos } = reducerState.toJS();
 
-  useEffect(() => {
-    const getData = async () => {
-      try {
-        const { data } = await axios.get('https://strapi.io/videos', {
-          timeout: 1000,
-        });
-        const { didWatchVideos, videos } = formatVideoArray(data);
-
-        dispatch({
-          type: 'GET_DATA_SUCCEEDED',
-          didWatchVideos,
-          videos,
-        });
-      } catch (err) {
-        console.error(err);
-        dispatch({
-          type: 'HIDE_VIDEO_ONBOARDING',
-        });
-      }
-    };
-
-    getData();
-  }, []);
+  // [PK] remove useless code
+  dispatch({
+    type: 'HIDE_VIDEO_ONBOARDING',
+  });
 
   // Hide the player in case of request error
   if (isLoading) {
diff --git a/packages/strapi-admin/controllers/admin.js b/packages/strapi-admin/controllers/admin.js
index 91df62d7c..56db99604 100644
--- a/packages/strapi-admin/controllers/admin.js
+++ b/packages/strapi-admin/controllers/admin.js
@@ -30,9 +30,12 @@ module.exports = {
     const strapiVersion = strapi.config.get('info.strapi', null);
     const nodeVersion = process.version;
     const communityEdition = !strapi.EE;
-
+    // [PK] add package info
+    const appPackageName = strapi.config.get('info.name', null);
+    const appPackageVersion = strapi.config.get('info.version', null);
+    
     return {
-      data: { currentEnvironment, autoReload, strapiVersion, nodeVersion, communityEdition },
+      data: { currentEnvironment, autoReload, strapiVersion, nodeVersion, communityEdition, appPackageName, appPackageVersion },
     };
   },
 
diff --git a/packages/strapi-admin/services/user.js b/packages/strapi-admin/services/user.js
index 20e86226f..901aeadcb 100644
--- a/packages/strapi-admin/services/user.js
+++ b/packages/strapi-admin/services/user.js
@@ -37,7 +37,7 @@ const create = async attributes => {
   const user = createUser(userInfo);
   const createdUser = await strapi.query('user', 'admin').create(user);
 
-  await strapi.admin.services.metrics.sendDidInviteUser();
+  // [PK] removed telemetry
 
   return createdUser;
 };

```

### Misc

```diff


diff --git a/packages/strapi-plugin-documentation/public/login.html b/packages/strapi-plugin-documentation/public/login.html
index ccd28ad46..57dc0c14f 100755
--- a/packages/strapi-plugin-documentation/public/login.html
+++ b/packages/strapi-plugin-documentation/public/login.html
@@ -118,7 +118,7 @@
           <div class="container">
             <div class="row">
               <div class="col-lg-6 col-lg-offset-3 col-md-12">
-                <img alt="Strapi logo" class="logo" src="https://strapi.io/assets/images/logo_login.png">
+                <img alt="Strapi logo" class="logo" src="/assets/images/logo_login.png">
                 <h2 class="sub-title">Enter the password to access the documentation.</h2>
                 <form method="post" action="<%=actionUrl%>">
                   <span class="error">Wrong password...</span>
diff --git a/packages/strapi-plugin-documentation/services/Documentation.js b/packages/strapi-plugin-documentation/services/Documentation.js
index 5063ff914..2a1bf6a53 100755
--- a/packages/strapi-plugin-documentation/services/Documentation.js
+++ b/packages/strapi-plugin-documentation/services/Documentation.js
@@ -411,7 +411,8 @@ module.exports = {
           const { name, plugin } = routeTagConfig;
           const referencePlugin = !_.isEmpty(plugin);
 
-          key = referencePlugin ? `${plugin}-${name}` : name.toLowerCase();
+          // [PK] support partial tag info in routes.config.tag
+          key = referencePlugin ? `${plugin}-${name}` : (name ? name.toLowerCase() : apiName);
           tags = referencePlugin ? this.formatTag(plugin, name) : _.upperFirst(name);
         } else {
           key = routeTagConfig.toLowerCase();

diff --git a/packages/strapi-utils/lib/sanitize-entity.js b/packages/strapi-utils/lib/sanitize-entity.js
index d144679b0..dd489a163 100644
--- a/packages/strapi-utils/lib/sanitize-entity.js
+++ b/packages/strapi-utils/lib/sanitize-entity.js
@@ -11,7 +11,8 @@ const {
 
 const { ID_ATTRIBUTE } = constants;
 
-const sanitizeEntity = (dataSource, options) => {
+// [PK] add ignore parameter
+const sanitizeEntity = (dataSource, options, ignore = null) => {
   const { model, withPrivate = false, isOutput = true, includeFields = null } = options;
 
   if (typeof dataSource !== 'object' || _.isNil(dataSource)) {
@@ -25,7 +26,7 @@ const sanitizeEntity = (dataSource, options) => {
   }
 
   if (_.isArray(data)) {
-    return data.map(entity => sanitizeEntity(entity, options));
+    return data.map(entity => sanitizeEntity(entity, options, ignore));
   }
 
   if (_.isNil(model)) {
@@ -46,6 +47,7 @@ const sanitizeEntity = (dataSource, options) => {
     if (shouldRemoveAttribute(model, key, attribute, { withPrivate, isOutput })) {
       return acc;
     }
+    if (ignore && ignore.find(e => e === key)) return acc;
 
     // Relations
     const relation = attribute && (attribute.model || attribute.collection || attribute.component);

```
