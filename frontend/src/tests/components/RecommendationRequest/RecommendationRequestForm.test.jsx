import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import {
  email_regex,
  isodate_regex,
} from "main/components/RecommendationRequest/RecommendationRequestForm";
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

    expect(
      screen.getByTestId(/RecommendationRequestForm-requesterEmail/),
    ).toHaveValue("cgaucho@ucsb.edu");
    expect(
      screen.getByTestId(/RecommendationRequestForm-professorEmail/),
    ).toHaveValue("phtcon@ucsb.edu");
    expect(
      screen.getByTestId(/RecommendationRequestForm-explanation/),
    ).toHaveValue("BS/MS program");
    expect(
      screen.getByTestId(/RecommendationRequestForm-dateRequested/),
    ).toHaveValue("2022-04-20T00:00");
    expect(
      screen.getByTestId(/RecommendationRequestForm-dateNeeded/),
    ).toHaveValue("2022-05-01T00:00");
    expect(
      screen.getByTestId(/RecommendationRequestForm-done/),
    ).not.toBeChecked();
  });

  test("Correct error messages on missing input", async () => {
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

  test("Correct error messages on bad input", async () => {
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

    expect(
      screen.queryByText(/RequesterEmail must be a valid email./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/ProfessorEmail must be a valid email./),
    ).not.toBeInTheDocument();

    fireEvent.change(requesterEmailField, { target: { value: "bad-email" } });
    fireEvent.change(professorEmailField, { target: { value: "bad-email" } });
    fireEvent.click(submitButton);

    await screen.findByText(/RequesterEmail must be a valid email./);
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

  test("email_regex works correctly", () => {
    expect("abc@def.ghi".match(email_regex)?.[0]).toBe("abc@def.ghi");
    expect("a@b.c".match(email_regex)?.[0]).toBe("a@b.c");

    expect(email_regex.test("abc@def")).toBe(false);
    expect(email_regex.test("@def.ghi")).toBe(false);
    expect(email_regex.test("abc@.ghi")).toBe(false);
  });

  test("isodate_regex works correctly", () => {
    expect("2022-01-01T23:59:59.999".match(isodate_regex)?.[0]).toBe(
      "2022-01-01T23:59:59.999",
    );
    expect("2022-01-01T23:59:59".match(isodate_regex)?.[0]).toBe(
      "2022-01-01T23:59:59",
    );
    expect("2022-01-01T23:59".match(isodate_regex)?.[0]).toBe(
      "2022-01-01T23:59",
    );

    expect(isodate_regex.test("202-01-01T23:59")).toBe(false);
    expect(isodate_regex.test("2022-1-01T23:59")).toBe(false);
    expect(isodate_regex.test("2022-01-1T23:59")).toBe(false);
    expect(isodate_regex.test("2022-01-01T3:59")).toBe(false);
    expect(isodate_regex.test("2022-01-01T23:5")).toBe(false);
    expect(isodate_regex.test("invalid")).toBe(false);
  });
});
