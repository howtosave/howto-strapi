//
// React utils
//

var _reactElementCounter = 0;
var _reactElements = {};

//
// attribute update listener
//
var _reactElementObserver = new MutationObserver(function(mutations, observer) {
  mutations.forEach(function(mutation) {
    if (mutation.type == "attributes") {
      renderReactElement(null, mutation.target);
    }
  });
});

//
// element renderer
//
function renderReactElement(ele, container) {
  container = typeof container === "string" ? document.getElementById(container) : container;

  if (!ele) {
    ele = _reactElements[container.dataset.__id];
  } else {
    const eleId = "" + _reactElementCounter++;
    _reactElements[eleId] = ele;
    container.dataset.__id = eleId;
    //
    _reactElementObserver.observe(container, {
      attributes: true //configure it to listen to attribute changes
    });
  }

  const props = Object.keys(container.dataset).reduce((acc, e) => { if (e !== "__id") acc[e] = container.dataset[e]; return acc; }, {});
  ReactDOM.render(
    React.createElement(ele, props, null),
    container
  );
}
