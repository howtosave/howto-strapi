
var cache = [];

function circularSafeReplacerReset() {
  cache = [];
}

function circularSafeReplacer(_, value) {
  if (typeof value === 'object' && value !== null) {
    // Duplicate reference found, discard key
    if (cache.includes(value)) return;

    // Store value in our collection
    cache.push(value);
  }
  return value;
}

module.exports = {
  circularSafeReplacer,
  circularSafeReplacerReset,
}
