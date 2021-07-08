function Subject() {
  this.waiter = {};
}

Subject.prototype.wait = function () {
  const promise = new Promise((resolve) => {
    let resolved = false;

    this.waiter.resolve = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };
  });
  return promise;
};

Subject.prototype.notify = function () {
  this.waiter.resolve();
};

module.exports = Subject;
