import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const expectedHeaders = [
    "Org Code",
    "Org Translation Short",
    "Org Translation",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).not.toBeDisabled();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization}
        />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("ARTS");
    expect(screen.getByTestId(`${testId}-orgCode`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "Arts",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "College of Letters and Science - Arts and Humanities",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Org Code is required./);
    expect(
      screen.getByText(/Org Translation Short is required./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Org Translation is required./),
    ).toBeInTheDocument();
  });

  test("that submitAction is called with good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-orgCode`), {
      target: { value: "LIBR" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "Library" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "UCSB Library" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
  });
});
