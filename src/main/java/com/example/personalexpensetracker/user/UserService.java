package com.example.personalexpensetracker.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User upsertUser(String provider, OAuth2User oauth2User) {
        String providerUserId = oauth2User.getName();
        final String email = oauth2User.getAttribute("email");
        final String displayName = getDisplayName(provider, oauth2User);
        final String avatarUrl = getAvatarUrl(provider, oauth2User);

        return userRepository.findByProviderAndProviderUserId(provider, providerUserId)
                .map(existingUser -> {
                    existingUser.setEmail(email);
                    existingUser.setDisplayName(displayName);
                    existingUser.setAvatarUrl(avatarUrl);
                    existingUser.setUpdatedAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(UUID.randomUUID().toString())
                            .provider(provider)
                            .providerUserId(providerUserId)
                            .email(email)
                            .displayName(displayName)
                            .avatarUrl(avatarUrl)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    private String getDisplayName(String provider, OAuth2User oauth2User) {
        if ("google".equals(provider)) {
            return oauth2User.getAttribute("name");
        } else if ("github".equals(provider)) {
            return oauth2User.getAttribute("login");
        }
        return null;
    }

    private String getAvatarUrl(String provider, OAuth2User oauth2User) {
        if ("google".equals(provider)) {
            return oauth2User.getAttribute("picture");
        } else if ("github".equals(provider)) {
            return oauth2User.getAttribute("avatar_url");
        }
        return null;
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
