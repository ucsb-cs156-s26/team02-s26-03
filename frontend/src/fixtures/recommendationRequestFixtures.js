const recommendationRequestFixtures = {
    oneRecommendationRequest: {
        "id": 1,
        "requesterEmail": "cgaucho@ucsb.edu",
        "professorEmail": "phtcon@ucsb.edu",
        "explanation": "BS/MS program",
        "dateRequested": "2022-04-20T00:00:00",
        "dateNeeded": "2022-05-01T00:00:00",
        "done": false
    },
    threeRecommendationRequests: [
        {
            "id": 2,
            "requesterEmail": "ldelplaya@ucsb.edu",
            "professorEmail": "phtcon@ucsb.edu",
            "explanation": "PhD Architecture",
            "dateRequested": "2022-05-20T00:00:00",
            "dateNeeded": "2022-11-15T00:00:00",
            "done": false
        },
        {
            "id": 3,
            "requesterEmail": "pdiddy@ucsb.edu",
            "professorEmail": "alopez@ucsb.edu",
            "explanation": "REU Program",
            "dateRequested": "2022-06-01T00:00:00",
            "dateNeeded": "2022-06-20T00:00:00",
            "done": true
        },
        {
            "id": 4,
            "requesterEmail": "storke123@ucsb.edu",
            "professorEmail": "amunda@ucsb.edu",
            "explanation": "Stanford Graduate School",
            "dateRequested": "2022-08-11T00:00:00",
            "dateNeeded": "2022-12-15T00:00:00",
            "done": false
        }
    ]
};


export { recommendationRequestFixtures };