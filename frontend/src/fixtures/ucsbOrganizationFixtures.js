const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ARTS",
    orgTranslationShort: "Arts",
    orgTranslation: "College of Letters and Science - Arts and Humanities",
    inactive: false,
  },

  threeOrganizations: [
    {
      orgCode: "ARTS",
      orgTranslationShort: "Arts",
      orgTranslation: "College of Letters and Science - Arts and Humanities",
      inactive: false,
    },
    {
      orgCode: "ENGR",
      orgTranslationShort: "Engineering",
      orgTranslation: "College of Engineering",
      inactive: false,
    },
    {
      orgCode: "EXT",
      orgTranslationShort: "Extension",
      orgTranslation: "UCSB Extension",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
