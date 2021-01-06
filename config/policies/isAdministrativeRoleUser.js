module.exports = async (ctx, next) => {
  if (!ctx.state.user) return ctx.unauthorized("unauthorized");
  //console.log("USER ROLE TYPE", ctx.state.user.role.type, ctx.state.user.username);
  if (ctx.state.user.role.type !== "administrative") return ctx.unauthorized("not allowed");
  await next();
};
