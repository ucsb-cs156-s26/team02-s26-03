package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Locator;
import edu.ucsb.cs156.example.WebTestCase;
import java.net.URI;
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
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsb_organization() throws Exception {
    setupUser(true);

    page.navigate(URI.create(page.url()).resolve("/ucsborganization").toString());
    page.waitForURL("**/ucsborganization");

    page.getByText("Create UCSBOrganization").click(new Locator.ClickOptions().setTimeout(180_000));
    assertThat(page.getByText("Create New UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgCode").fill("LIBR");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("Library");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("UCSB Library");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("UCSB Library");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("Library Updated");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("UCSB Library Updated");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("UCSB Library Updated");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsb_organization() throws Exception {
    setupUser(false);

    page.navigate(URI.create(page.url()).resolve("/ucsborganization").toString());
    page.waitForURL("**/ucsborganization");

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }
}
