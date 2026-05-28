package com.example.personalexpensetracker.auth;

import com.example.personalexpensetracker.testutil.BaseControllerTest;
import com.example.personalexpensetracker.testutil.SecurityTestUtils;
import com.example.personalexpensetracker.user.User;
import com.example.personalexpensetracker.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OAuth2LoginIntegrationTest extends BaseControllerTest {

    @MockitoBean
    private UserService userService;

    @BeforeEach
    void stubUserService() {
        when(userService.getUserById(anyString())).thenAnswer(invocation -> {
            String id = invocation.getArgument(0);
            return User.builder()
                    .id(id)
                    .email("test@example.com")
                    .displayName("Test User")
                    .provider("google")
                    .providerUserId(id)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        });
    }

    @Test
    void testUnauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAuthenticatedRequestWithCustomOAuth2User() throws Exception {
        String userId = "test-user-123";

        mockMvc.perform(get("/api/v1/me")
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(userId)));
    }

    @Test
    void testCustomOAuth2UserMockingWithGoogleProvider() throws Exception {
        String userId = "google-user-456";
        String email = "user@gmail.com";
        CustomOAuth2User oauth2User = SecurityTestUtils.createMockCustomOAuth2User(userId, email);
        var auth = SecurityTestUtils.createAuthenticationWithCustomOAuth2User(oauth2User);

        mockMvc.perform(get("/api/v1/me")
                .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(userId)));
    }

    @Test
    void testOidcUserMocking() throws Exception {
        String userId = "oidc-user-789";
        OidcUser oidcUser = SecurityTestUtils.createMockOidcUser(userId, "user@example.com");

        var auth = new UsernamePasswordAuthenticationToken(
                oidcUser, null, AuthorityUtils.createAuthorityList("ROLE_USER"));

        mockMvc.perform(get("/api/v1/me")
                .with(authentication(auth)))
                .andExpect(status().isOk());
    }

    @Test
    void testMultipleUsersHaveIsolatedContexts() throws Exception {
        String user1Id = "user-1";
        String user2Id = "user-2";

        MvcResult result1 = mockMvc.perform(get("/api/v1/me")
                .with(SecurityTestUtils.withUser(user1Id)))
                .andExpect(status().isOk())
                .andReturn();
        assert result1.getResponse().getContentAsString().contains(user1Id);

        MvcResult result2 = mockMvc.perform(get("/api/v1/me")
                .with(SecurityTestUtils.withUser(user2Id)))
                .andExpect(status().isOk())
                .andReturn();
        assert result2.getResponse().getContentAsString().contains(user2Id);
    }
}
