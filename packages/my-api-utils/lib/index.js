const zeitMs = require("./zeit-ms");
const { generateSecurePathHash, generateSecureLink } = require("./secure-link");

const formatError = (error) => ({
  id: error.id,
  message: error.message,
  field: error.field,
});

const formatMongoError = (error, mongoError, isDebug = false) =>
  formatError({
    ...error,
    message: isDebug
      ? mongoError.errmsg
      : mongoError.code === 11000
      ? "DUPLICATE_KEY"
      : mongoError.code === 2
      ? "BAD_VALUE"
      : mongoError.code === 26
      ? "NAMESPACE_NOT_FOUND"
      : mongoError.code === 50
      ? "EXCEEDED_TIME_LIMIT"
      : mongoError.code === 59
      ? "COMMAND_NOT_FOUND"
      : mongoError.code === 64
      ? "WRITE_CONCERN_ERROR"
      : mongoError.code === 10107
      ? "NOT_MASTER"
      : mongoError.code === 8
      ? "UNKNOWN_ERROR"
      : `${mongoError.code}`,
  });

const formatNormalError = (error, normalError, isDebug = false) =>
  formatError({
    ...error,
    message: isDebug
      ? `${normalError.name}:${normalError.message}:${normalError.description ||
          JSON.stringify(normalError.data)}`
      : `${normalError.name}`,
  });

const errorResponse = {
  400: (ctx, id, message) => ctx.badRequest(null, formatError({ id, message })),
};

const RE_OBJECT_ID = new RegExp("^[0-9a-fA-F]{24}$");
const isObjectId = (id) => RE_OBJECT_ID.test(id);

module.exports = {
  zeitMs,
  formatError,
  formatMongoError,
  formatNormalError,
  errorResponse,
  isObjectId,
  generateSecurePathHash,
  generateSecureLink,
};
