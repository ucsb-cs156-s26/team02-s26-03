import React from 'react';
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

export default {
    title: 'pages/RecommendationRequest/RecommendationRequestEditPage',
    component: RecommendationRequestEditPage
};

const Template = () => <RecommendationRequestEditPage />;

export const Default = Template.bind({});

Default.parameters = {
    msw: [
        http.get('/api/currentUser', () => {
            return HttpResponse.json(apiCurrentUserFixtures.userOnly);
        }),
        http.get('/api/systemInfo', () => {
            return HttpResponse.json(systemInfoFixtures.showingNeither);
        }),
        http.get('/api/recommendationrequest', () => {
            return HttpResponse.json(recommendationRequestFixtures.threeRecommendationRequests[0]);
        }),
        http.put('/api/recommendationrequest', async ({ request }) => {
            const data = await request.json();
            return HttpResponse.json({ id: 17, ...data });
        }),
    ],
}