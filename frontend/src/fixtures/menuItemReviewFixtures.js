const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 27,
    reviewerEmail: "a@ucsb.edu",
    stars: 3,
    dateReviewed: "2022-04-20T00:00:00",
    comments: "A",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 27,
      reviewerEmail: "a@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-20T00:00:00",
      comments: "A",
    },
    {
      id: 2,
      itemId: 29,
      reviewerEmail: "b@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-04-21T00:00:00",
      comments: "B",
    },
    {
      id: 3,
      itemId: 31,
      reviewerEmail: "c@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-04-22T12:30:00",
      comments: "Solid meal; would order again.",
    },
  ],
};

export { menuItemReviewFixtures };
