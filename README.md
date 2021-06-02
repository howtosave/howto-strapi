# strapi fork for CARBON

## Merge sequence

### merge strapi

```sh
# go to strapi submodule directory
cd strapi

# add original strapi repository if necessary
git remote add strapi https://github.com/strapi/strapi.git

# checkout base version
git checkout my3.6.1

# create a branch for new version
git checkout -b my3.6.2

# *fetch* (not pull) the new version from remote strapi
git fetch strapi v3.6.2

# merge with the fetched version
git merge FETCH_HEAD

# resolve conflicts and commits

# !!! N.B. !!!
# build strapi-helper-plugin
cd packages/strapi-helper-plugin
yarn build

# gen diff
bash tools/diff/gen-strapi-diff.sh v3.6.1
```

### merge example

```sh
# check diff briefly
diff -qrZ --exclude documentation -x .git -x strapi -x exports -x node_modules -x build -x .cache -x .tmp -x .env -x packages -x tools ./ ./strapi/examples/getstarted

# do merging work with emacs
emacs --eval '(ediff-directories "./" "./strapi/examples/getstarted/" ".*")'
```

## Tools

### Initial setup

#### Database

```sh
# create database and users
node tools/setup/mongodb.js
```
