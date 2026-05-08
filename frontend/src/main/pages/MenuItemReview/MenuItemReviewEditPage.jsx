import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import { dateReviewedToRequestParam } from "main/utils/menuItemReviewUtils";

export default function MenuItemReviewEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: review,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/MenuItemReview?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/MenuItemReview`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (updated) => ({
    url: "/api/MenuItemReview",
    method: "PUT",
    params: {
      id: updated.id,
    },
    data: {
      itemId: updated.itemId,
      reviewerEmail: updated.reviewerEmail,
      stars: updated.stars,
      dateReviewed: dateReviewedToRequestParam(updated.dateReviewed),
      comments: updated.comments,
    },
  });

  const onSuccess = (saved) => {
    toast(`MenuItemReview Updated - id: ${saved.id} itemId: ${saved.itemId}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/MenuItemReview?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreview" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit MenuItemReview</h1>
        {review && (
          <MenuItemReviewForm
            initialContents={review}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
