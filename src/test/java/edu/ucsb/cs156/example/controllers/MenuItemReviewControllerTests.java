package edu.ucsb.cs156.example.controllers;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WebMvcTest(controllers = MenuItemReviewController.class)
@Import(TestConfig.class)
public class MenuItemReviewControllerTests extends ControllerTestCase {

  @MockitoBean MenuItemReviewRepository menuItemReviewRepository;
  @MockitoBean UserRepository userRepository;

  private final LocalDateTime dateReviewed = LocalDateTime.parse("2022-04-20T00:00:00");
  private final LocalDateTime updatedDateReviewed = LocalDateTime.parse("2022-04-21T00:00:00");

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/MenuItemReview/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/MenuItemReview/all")).andExpect(status().isOk());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void all_returns_list_of_reviews() throws Exception {
    MenuItemReview r1 =
        MenuItemReview.builder()
            .id(1)
            .itemId(27L)
            .reviewerEmail("a@ucsb.edu")
            .stars(3)
            .dateReviewed(dateReviewed)
            .comments("A")
            .build();

    MenuItemReview r2 =
        MenuItemReview.builder()
            .id(2)
            .itemId(29L)
            .reviewerEmail("b@ucsb.edu")
            .stars(5)
            .dateReviewed(updatedDateReviewed)
            .comments("B")
            .build();

    when(menuItemReviewRepository.findAll()).thenReturn(new ArrayList<>(Arrays.asList(r1, r2)));

    mockMvc
        .perform(get("/api/MenuItemReview/all"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1))
        .andExpect(jsonPath("$[0].itemId").value(27))
        .andExpect(jsonPath("$[0].reviewerEmail").value("a@ucsb.edu"))
        .andExpect(jsonPath("$[0].stars").value(3))
        .andExpect(jsonPath("$[0].dateReviewed").value("2022-04-20T00:00:00"))
        .andExpect(jsonPath("$[0].comments").value("A"))
        .andExpect(jsonPath("$[1].id").value(2))
        .andExpect(jsonPath("$[1].itemId").value(29))
        .andExpect(jsonPath("$[1].reviewerEmail").value("b@ucsb.edu"))
        .andExpect(jsonPath("$[1].stars").value(5))
        .andExpect(jsonPath("$[1].dateReviewed").value("2022-04-21T00:00:00"))
        .andExpect(jsonPath("$[1].comments").value("B"));
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc.perform(get("/api/MenuItemReview").param("id", "1")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void get_by_id_success() throws Exception {
    MenuItemReview r =
        MenuItemReview.builder()
            .id(1)
            .itemId(27L)
            .reviewerEmail("a@ucsb.edu")
            .stars(3)
            .dateReviewed(dateReviewed)
            .comments("A")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(r));

    mockMvc
        .perform(get("/api/MenuItemReview").param("id", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.itemId").value(27))
        .andExpect(jsonPath("$.reviewerEmail").value("a@ucsb.edu"))
        .andExpect(jsonPath("$.stars").value(3))
        .andExpect(jsonPath("$.dateReviewed").value("2022-04-20T00:00:00"))
        .andExpect(jsonPath("$.comments").value("A"));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void get_by_id_not_found() throws Exception {
    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(get("/api/MenuItemReview").param("id", "999"))
        .andExpect(status().isNotFound())
        .andExpect(content().string(containsString("MenuItemReview")))
        .andExpect(content().string(containsString("999")));
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "27")
                .param("reviewerEmail", "a@ucsb.edu")
                .param("stars", "3")
                .param("dateReviewed", "2022-04-20T00:00:00")
                .param("comments", "A")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "27")
                .param("reviewerEmail", "a@ucsb.edu")
                .param("stars", "3")
                .param("dateReviewed", "2022-04-20T00:00:00")
                .param("comments", "A")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_post() throws Exception {
    MenuItemReview saved =
        MenuItemReview.builder()
            .id(1)
            .itemId(27L)
            .reviewerEmail("a@ucsb.edu")
            .stars(3)
            .dateReviewed(dateReviewed)
            .comments("A")
            .build();

    when(menuItemReviewRepository.save(any())).thenReturn(saved);

    mockMvc
        .perform(
            post("/api/MenuItemReview/post")
                .param("itemId", "27")
                .param("reviewerEmail", "a@ucsb.edu")
                .param("stars", "3")
                .param("dateReviewed", "2022-04-20T00:00:00")
                .param("comments", "A")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.itemId").value(27))
        .andExpect(jsonPath("$.reviewerEmail").value("a@ucsb.edu"))
        .andExpect(jsonPath("$.stars").value(3))
        .andExpect(jsonPath("$.dateReviewed").value("2022-04-20T00:00:00"))
        .andExpect(jsonPath("$.comments").value("A"));

    ArgumentCaptor<MenuItemReview> captor = ArgumentCaptor.forClass(MenuItemReview.class);
    verify(menuItemReviewRepository).save(captor.capture());

    MenuItemReview review = captor.getValue();
    assertEquals(27L, review.getItemId());
    assertEquals("a@ucsb.edu", review.getReviewerEmail());
    assertEquals(3, review.getStars());
    assertEquals(dateReviewed, review.getDateReviewed());
    assertEquals("A", review.getComments());
  }

  @Test
  public void logged_out_users_cannot_put() throws Exception {
    MenuItemReview updated =
        MenuItemReview.builder()
            .itemId(29L)
            .reviewerEmail("b@ucsb.edu")
            .stars(4)
            .dateReviewed(updatedDateReviewed)
            .comments("B")
            .build();

    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_put() throws Exception {
    MenuItemReview updated =
        MenuItemReview.builder()
            .itemId(29L)
            .reviewerEmail("b@ucsb.edu")
            .stars(4)
            .dateReviewed(updatedDateReviewed)
            .comments("B")
            .build();

    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_put() throws Exception {
    MenuItemReview existing =
        MenuItemReview.builder()
            .id(1)
            .itemId(27L)
            .reviewerEmail("a@ucsb.edu")
            .stars(3)
            .dateReviewed(dateReviewed)
            .comments("A")
            .build();

    MenuItemReview updated =
        MenuItemReview.builder()
            .itemId(29L)
            .reviewerEmail("b@ucsb.edu")
            .stars(4)
            .dateReviewed(updatedDateReviewed)
            .comments("B")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(existing));

    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.itemId").value(29))
        .andExpect(jsonPath("$.reviewerEmail").value("b@ucsb.edu"))
        .andExpect(jsonPath("$.stars").value(4))
        .andExpect(jsonPath("$.dateReviewed").value("2022-04-21T00:00:00"))
        .andExpect(jsonPath("$.comments").value("B"));

    verify(menuItemReviewRepository).save(existing);
    assertEquals(29L, existing.getItemId());
    assertEquals("b@ucsb.edu", existing.getReviewerEmail());
    assertEquals(4, existing.getStars());
    assertEquals(updatedDateReviewed, existing.getDateReviewed());
    assertEquals("B", existing.getComments());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_put_not_found() throws Exception {
    MenuItemReview updated =
        MenuItemReview.builder()
            .itemId(29L)
            .reviewerEmail("b@ucsb.edu")
            .stars(4)
            .dateReviewed(updatedDateReviewed)
            .comments("B")
            .build();

    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(
            put("/api/MenuItemReview")
                .param("id", "999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))
                .with(csrf()))
        .andExpect(status().isNotFound())
        .andExpect(content().string(containsString("MenuItemReview")))
        .andExpect(content().string(containsString("999")));
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete() throws Exception {
    MenuItemReview r =
        MenuItemReview.builder()
            .id(1)
            .itemId(27L)
            .reviewerEmail("a@ucsb.edu")
            .stars(3)
            .dateReviewed(dateReviewed)
            .comments("A")
            .build();

    when(menuItemReviewRepository.findById(eq(1L))).thenReturn(Optional.of(r));

    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "1").with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("MenuItemReview with id 1 deleted"));

    verify(menuItemReviewRepository).delete(r);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void delete_not_found() throws Exception {
    when(menuItemReviewRepository.findById(eq(999L))).thenReturn(Optional.empty());

    mockMvc
        .perform(delete("/api/MenuItemReview").param("id", "999").with(csrf()))
        .andExpect(status().isNotFound())
        .andExpect(content().string(containsString("MenuItemReview")))
        .andExpect(content().string(containsString("999")));
  }
}
