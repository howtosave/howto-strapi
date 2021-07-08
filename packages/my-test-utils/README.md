# Test Utils

## Command-line usage

- test data generation

```sh
# user data generation
yarn gen-data user --size 10

# stat data generation for exercise program
yarn gen-data stat --subtarget prog --output ./output/test-stat

# stat data generation for unit exercise
yarn gen-data stat --subtarget unit --output ./output/test-stat

# course data generation
yarn gen-data course --days 10
```
