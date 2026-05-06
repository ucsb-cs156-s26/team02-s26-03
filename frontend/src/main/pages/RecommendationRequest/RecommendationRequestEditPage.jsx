import React from "react";
import { useParams } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { Navigate } from "react-router";

export default function RecommendationRequestEditPage({ upsert = false }) {
  let { id } = useParams();

  const {
    data: recommendationRequest,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/recommendationrequest?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so changing it to "" doesn't matter
      method: "GET",
      url: `/api/recommendationrequest`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (recommendationRequest) => ({
    url: "/api/recommendationrequest",
    method: "PUT",
    params: {
      id: recommendationRequest.id,
    },
    data: {
      requesterEmail: recommendationRequest.requesterEmail,
      professorEmail: recommendationRequest.professorEmail,
      explanation: recommendationRequest.explanation,
      dateRequested: recommendationRequest.dateRequested,
      dateNeeded: recommendationRequest.dateNeeded,
      done: recommendationRequest.done,
    },
  });

  const onSuccess = (recommendationRequest) => {
    toast(`RecommendationRequest Updated - id: ${recommendationRequest.id}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/recommendationrequest?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !upsert) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit RecommendationRequest</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            initialContents={recommendationRequest}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
