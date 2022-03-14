module.exports = async (ctx, next) => {
  const { user } = ctx.state;
  if (!user) return ctx.unauthorized("unauthorized");
  console.log(">>> isAdministrativeRole(): ", user.role.type, user.email);
  if (user.role.type !== "administrative") return ctx.unauthorized("not allowed");
  await next();
};
