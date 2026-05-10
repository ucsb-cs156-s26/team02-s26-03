package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestIT {
  @Autowired public CurrentUserService currentUserService;
  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;
  @Autowired RecommendationRequestRepository recommendationRequestRepository;
  @Autowired public MockMvc mockMvc;
  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendationrequest() throws Exception {
    String requesterEmail = "student@ucsb.edu";
    String professorEmail = "pconrad@ucsb.edu";
    String explanation = "Masters Program";
    String dateRequested = "2026-04-20T00:00:00";
    String dateNeeded = "2026-05-20T00:00:00";
    boolean done = true;

    mockMvc
        .perform(
            post("/api/recommendationrequest/post")
                .param("requesterEmail", requesterEmail)
                .param("professorEmail", professorEmail)
                .param("explanation", explanation)
                .param("dateRequested", dateRequested)
                .param("dateNeeded", dateNeeded)
                .param("done", String.valueOf(done))
                .with(csrf()))
        .andExpect(status().isOk())
        .andReturn();

    assertEquals(1, recommendationRequestRepository.count());
    RecommendationRequest result = recommendationRequestRepository.findAll().iterator().next();
    assertEquals(requesterEmail, result.getRequesterEmail());
    assertEquals(explanation, result.getExplanation());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_get_by_id_exists() throws Exception {
    RecommendationRequest req =
        RecommendationRequest.builder()
            .requesterEmail("student@ucsb.edu")
            .professorEmail("prof@ucsb.edu")
            .explanation("Grad School")
            .dateRequested(LocalDateTime.parse("2026-04-20T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-05-20T00:00:00"))
            .done(false)
            .build();

    recommendationRequestRepository.save(req);
    Long id = req.getId();

    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequest?id=" + id))
            .andExpect(status().isOk())
            .andReturn();

    String responseString = response.getResponse().getContentAsString();
    RecommendationRequest result = mapper.readValue(responseString, RecommendationRequest.class);
    assertEquals(req.getRequesterEmail(), result.getRequesterEmail());
  }
}
