import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { BrowserRouter as Router } from "react-router";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    expect(await screen.findByText(/Requester Email/)).toBeInTheDocument();
    expect(screen.getByText(/Create/)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <RecommendationRequestForm
          initialContents={
            recommendationRequestFixtures.oneRecommendationRequest
          }
        />
      </Router>,
    );
    expect(
      await screen.findByTestId(/RecommendationRequestForm-id/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/RecommendationRequestForm-id/)).toHaveValue("1");
  });

  test("Correct error messsages on missing input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/RequesterEmail is required./),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/ProfessorEmail is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/DateRequested is required./)).toBeInTheDocument();
    expect(screen.getByText(/DateNeeded is required./)).toBeInTheDocument();
  });

  test("Correct error messsages on bad input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    const requesterEmailField = screen.getByTestId(
      "RecommendationRequestForm-requesterEmail",
    );
    const professorEmailField = screen.getByTestId(
      "RecommendationRequestForm-professorEmail",
    );
    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "bad-email" } });
    fireEvent.change(professorEmailField, { target: { value: "bad-email" } });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/RequesterEmail must be a valid email./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ProfessorEmail must be a valid email./),
    ).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    const cancelButton = screen.getByTestId("RecommendationRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("does not render the id field when initialContents is not passed", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );
    expect(screen.queryByText(/Id/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("RecommendationRequestForm-id"),
    ).not.toBeInTheDocument();
  });
});
