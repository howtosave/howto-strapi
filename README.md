# HowTo Strapi V4

Mono-Repo for Strapi V4 Project

## strapi packages to be built after modification

After modification below packages, you should run `build` command.
Dependency packages installation is necessary to `build` the packages.

N.B.
You may remove the dependency packages under `node_modules` after building the modified packages.
You may got some errors when you run an application without removing the dependency packages under the `strapi` directory.

- @strapi/admin:
  - go to `strapi/packages/core/admin`
  - run `yarn build`
- @strapi/helper-plugin
  - go to `strapi/packages/core/helper-plugin`
  - run `yarn build`
- to remove all `node_modules` directories under `./strapi`
  - run `find ./strapi -type d -name node_modules | xargs rm -rf`

## Merging with new strapi version

```sh
cd ./strapi
# fetch new version from strapi
git fetch -q strapi v4.1.3
git co FETCH_HEAD
# create new branch for the new version
git co -b v4.1.3

# create new branch for my version from the prev version, my4.1.2
git co my4.1.2
git co -b my4.1.3

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
