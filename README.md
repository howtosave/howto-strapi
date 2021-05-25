# strapi fork for CARBON

## Merge sequence

### merge strapi

```sh
cd strapi

# add original strapi repository
git remote add strapi https://github.com/strapi/strapi.git

# checkout base version
git checkout my3.0.5

# create a branch for new version
git checkout -b my3.0.6

# merge with the specific strapi version
git pull strapi v3.0.6

# resolve conflicts and commits
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
