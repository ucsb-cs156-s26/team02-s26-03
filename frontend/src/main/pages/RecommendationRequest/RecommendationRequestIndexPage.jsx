import React from "react";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: recommendationRequests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequest/all"],
    { method: "GET", url: "/api/recommendationrequest/all" },
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/recommendationrequest/create"
          style={{ float: "right" }}
        >
          Create RecommendationRequest
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>RecommendationRequests</h1>
        <RecommendationRequestTable
          // Stryker disable next-line all : empty list fallback is tested in RecommendationRequestIndexPage.test.jsx
          requests={recommendationRequests || []}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
