import { useMemo } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { toDateTimeLocalValue } from "main/utils/menuItemReviewUtils";

// Stryker disable Regex
const email_regex = /\S+@\S+\.\S+/;
const isodate_regex =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
// Stryker restore Regex

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const defaultValues = useMemo(() => {
    if (!initialContents) {
      return {
        itemId: "",
        reviewerEmail: "",
        stars: "",
        dateReviewed: "",
        comments: "",
      };
    }
    return {
      ...initialContents,
      dateReviewed: toDateTimeLocalValue(initialContents.dateReviewed),
    };
  }, [initialContents]);

  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "MenuItemReviewForm";

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col xs={12} md={4}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid={`${testIdPrefix}-id`}
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col xs={12} md={4}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="itemId">Menu Item ID</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-itemId`}
              id="itemId"
              type="number"
              step={1}
              isInvalid={Boolean(errors.itemId)}
              {...register("itemId", {
                required: "Menu item ID is required.",
                min: {
                  value: 1,
                  message: "Menu item ID must be at least 1.",
                },
                valueAsNumber: true,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.itemId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="reviewerEmail">Reviewer Email</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-reviewerEmail`}
              id="reviewerEmail"
              type="text"
              isInvalid={Boolean(errors.reviewerEmail)}
              {...register("reviewerEmail", {
                required: "Reviewer email is required.",
                pattern: {
                  value: email_regex,
                  message: "Reviewer email must be a valid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reviewerEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={4}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="stars">Star Rating (1–5)</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-stars`}
              id="stars"
              type="number"
              step={1}
              isInvalid={Boolean(errors.stars)}
              {...register("stars", {
                required: "Star rating is required.",
                min: {
                  value: 1,
                  message: "Stars must be at least 1.",
                },
                max: {
                  value: 5,
                  message: "Stars must be at most 5.",
                },
                valueAsNumber: true,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.stars?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col xs={12} md={8}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateReviewed">Date Reviewed</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-dateReviewed`}
              id="dateReviewed"
              type="datetime-local"
              isInvalid={Boolean(errors.dateReviewed)}
              {...register("dateReviewed", {
                required: "Date reviewed is required.",
                pattern: {
                  value: isodate_regex,
                  message:
                    "Date reviewed must be a valid date/time (ISO-style).",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateReviewed?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="comments">Comments</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-comments`}
              id="comments"
              as="textarea"
              rows={3}
              isInvalid={Boolean(errors.comments)}
              {...register("comments", {
                required: "Comments are required.",
                maxLength: {
                  value: 500,
                  message: "Comments may be at most 500 characters.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.comments?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid={`${testIdPrefix}-cancel`}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default MenuItemReviewForm;
