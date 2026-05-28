package com.example.personalexpensetracker.testutil;

import com.example.personalexpensetracker.auth.CustomOAuth2User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class SecurityTestUtils {

    private static final Collection<? extends GrantedAuthority> DEFAULT_AUTHORITIES =
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

    public static CustomOAuth2User createMockCustomOAuth2User(String userId) {
        return createMockCustomOAuth2User(userId, "test@example.com");
    }

    public static CustomOAuth2User createMockCustomOAuth2User(String userId, String email) {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", userId);
        attributes.put("email", email);
        attributes.put("name", "Test User");
        return new CustomOAuth2User(attributes, DEFAULT_AUTHORITIES, userId);
    }

    public static OidcUser createMockOidcUser(String userId) {
        return createMockOidcUser(userId, "test@example.com");
    }

    public static OidcUser createMockOidcUser(String userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("name", "Test User");
        claims.put("sub", userId);

        OidcIdToken idToken = new OidcIdToken(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                claims
        );

        return new DefaultOidcUser(DEFAULT_AUTHORITIES, idToken);
    }

    public static Authentication createMockAuthentication(String userId) {
        CustomOAuth2User principal = createMockCustomOAuth2User(userId);
        return new UsernamePasswordAuthenticationToken(principal, null, DEFAULT_AUTHORITIES);
    }

    public static void setSecurityContext(String userId) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(createMockAuthentication(userId));
        SecurityContextHolder.setContext(context);
    }

    public static void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    public static Authentication createAuthenticationWithCustomOAuth2User(CustomOAuth2User user) {
        return new UsernamePasswordAuthenticationToken(user, null, DEFAULT_AUTHORITIES);
    }

    public static RequestPostProcessor withUser(String userId) {
        return SecurityMockMvcRequestPostProcessors.authentication(createMockAuthentication(userId));
    }
}
