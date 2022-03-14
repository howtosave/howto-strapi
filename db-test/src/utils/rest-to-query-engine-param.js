const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

const _pp2obj = (pp) => pp && Array.isArray(pp) ? pp.reduce((acc, e) => {
  acc[e] = true;
  return acc;
}, {}) : { [pp]: true };

const _toOrderBy = (s) => {
  const a = s.split(':');
  return { [a[0]]: a[1] || 'asc' };
};

const _toLimit = (l) => !l ? DEFAULT_LIMIT : l > MAX_LIMIT ? MAX_LIMIT : l;

const _sort2orderBy = (sort) => sort && Array.isArray(sort) ? sort.map((e) => (
  _toOrderBy(e)
)) : _toOrderBy(sort);

const toQueryEngineParams = (params, verb) => {
  const { 
    select, limit, offset, sort, populate, fields,
    // TODO
    filters, publicationState, _locale, pagination,
    // rest
    ...where } = params;
  const orderBy = sort && _sort2orderBy(sort);

  const _select = select || fields && { select: select || fields };
  const _where = where || filters && { where: where || filters };
  const _populate = populate && {populate:_pp2obj(populate)};
  switch (verb) {
    case 'create':
      return Object.assign({}, _select, _populate);
    case 'findMany':
      return Object.assign({ limit: _toLimit(limit) }, _select, _where, offset && {offset}, orderBy && {orderBy}, _populate);
    case 'findOne':
      return Object.assign({}, _select, _where, offset && {offset}, orderBy && {orderBy}, _populate);
    case 'update':
    case 'delete':
      return Object.assign({}, _select, _where, _populate);
  }
  return Object.assign({ limit: _toLimit(limit) }, _select, _where, offset && {offset}, orderBy && {orderBy}, _populate);
};


module.exports = {
  toQueryEngineParams
};
