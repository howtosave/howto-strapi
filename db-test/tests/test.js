
const _pp2obj = (pp) => Array.isArray(pp) ? pp.reduce((acc, e) => {
  acc[e] = true;
  return acc;
}, {}) : { [pp]: true };

const _toQueryEngineParams = (params, verb) => {
  const { select, where, limit, offset, orderBy } = params;
  const populate = params.populate && _pp2obj(params.populate);
  switch (verb) {
    case 'create':
      return Object.assign({}, { select, populate });
    case 'findMany':
      return Object.assign({}, select && {select}, where && {where}, limit && {limit}, offset && {offset}, orderBy && {orderBy}, populate && {populate});
    case 'findOne':
      return Object.assign({}, select && {select}, where && {where}, offset && {offset}, orderBy && {orderBy}, populate && {populate});
    case 'update':
    case 'delete':
      return Object.assign({}, select && {select}, where && {where}, populate && {populate});
  }
  return Object.assign({}, select && {select}, where && {where}, limit && {limit}, offset && {offset}, orderBy && {orderBy}, populate && {populate});
};

function _do(param, verb) {
  console.log(">>>", _toQueryEngineParams(param, verb));
}

const a = 1, b = 2;
_do({ select: {a}, populate: [a,b], limit: 10, offset: 20 }, 'create');
_do({ select: {b}, populate: a }, 'findMany');
_do({ select: {a}, populate: b }, 'findOne');
_do({ select: {b}, populate: [a] }, 'update');
_do({ select: {a}, populate: [] }, 'delete');
