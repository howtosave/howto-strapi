module.exports = {
  definition: ``,
  query: `
    bboardWithBid(id: ID!, bid: ID!, publicationState: PublicationState): BulletinBoardsBboard
  `,
  type: {},
  resolver: {
    Query: {
      bboardWithBid: {
        description: "",
        resolver: "plugins::bulletin-boards.bboard.findOne",
      }
    },
  },
};
