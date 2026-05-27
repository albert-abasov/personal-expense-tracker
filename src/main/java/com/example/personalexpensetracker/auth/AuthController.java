package com.example.personalexpensetracker.auth;

import com.example.personalexpensetracker.common.UserDTO;
import com.example.personalexpensetracker.user.User;
import com.example.personalexpensetracker.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String userId = null;
        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomOAuth2User) {
            userId = ((CustomOAuth2User) principal).getUserId();
        } else if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser) {
            org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser =
                (org.springframework.security.oauth2.core.oidc.user.OidcUser) principal;
            userId = (String) oidcUser.getAttributes().get("userId");
        }

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getDisplayName())
                .picture(user.getAvatarUrl())
                .build();

        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.ok().build();
    }
}
