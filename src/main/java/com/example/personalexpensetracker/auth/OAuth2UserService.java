package com.example.personalexpensetracker.auth;

import com.example.personalexpensetracker.user.User;
import com.example.personalexpensetracker.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        User user = userService.upsertUser(registrationId, oauth2User);

        Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());
        attributes.put("userId", user.getId());

        return new CustomOAuth2User(attributes, oauth2User.getAuthorities(), user.getId());
    }
}
