module.exports = {
  definition: ``,
  query: `
    postWithBid(id: ID!, bid: ID!, publicationState: PublicationState): BulletinBoardsPost
  `,
  type: {},
  resolver: {
    Query: {
      postWithBid: {
        description: "",
        resolver: "plugins::bulletin-boards.post.findOne",
      }
    },
  },
};
