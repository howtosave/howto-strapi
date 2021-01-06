module.exports = ({ env }) => ({
  graphql: {
    endpoint: `${env("URL_PREFIX")}/___gql`,
    tracing: false,
    amountLimit: 20,
    depthLimit: 10,
    playgroundAlways: process.env.NODE_ENV !== "production",
  },
});
