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
# copy example files
cp -r strapi/examples/getstarted/* ./

```
