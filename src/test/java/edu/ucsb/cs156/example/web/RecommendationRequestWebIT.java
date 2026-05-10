package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_recommendation_request() throws Exception {
    setupUser(true);

    page.navigate("http://localhost:8080");

    assertThat(page.getByText("Welcome")).isVisible();

    page.locator("a[href='/recommendationrequest']").click();

    page.waitForURL("**/recommendationrequest");
    assertThat(page.getByTestId("RecommendationRequestTable"))
        .isVisible(
            new com.microsoft.playwright.assertions.LocatorAssertions.IsVisibleOptions()
                .setTimeout(10000));

    page.locator("a[href='/recommendationrequest/create']").click();

    page.waitForURL("**/recommendationrequest/create");
    assertThat(page.getByText("Create New RecommendationRequest"))
        .isVisible(
            new com.microsoft.playwright.assertions.LocatorAssertions.IsVisibleOptions()
                .setTimeout(10000));

    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("pconrad@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Masters Program");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2026-05-20T00:00");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2026-06-01T00:00");
    page.getByTestId("RecommendationRequestForm-done").check()   ;

    page.getByTestId("RecommendationRequestForm-submit").click();
    page.waitForURL("**/recommendationrequest");

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("Masters Program");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    page.waitForURL("**/recommendationrequest/edit/*");

    page.getByTestId("RecommendationRequestForm-explanation").fill("PhD Program");
    page.getByTestId("RecommendationRequestForm-submit").click();
    page.waitForURL("**/recommendationrequest");

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("PhD Program");

    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not()
        .isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendation_request() throws Exception {
    setupUser(false);

    page.navigate("http://localhost:8080");

    assertThat(page.getByText("Welcome")).isVisible();

    page.locator("a[href='/recommendationrequest']").click();
    page.waitForURL("**/recommendationrequest");

    assertThat(page.locator("a[href='/recommendationrequest/create']")).not().isVisible();
  }
}
