package com.example.personalexpensetracker.auth;

import com.example.personalexpensetracker.user.User;
import com.example.personalexpensetracker.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OidcUserServiceImpl extends OidcUserService {
    private final UserService userService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser oidcUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        User user = userService.upsertUser(registrationId, oidcUser);

        Map<String, Object> attributes = new LinkedHashMap<>(oidcUser.getAttributes());
        attributes.put("userId", user.getId());

        OidcUserInfo userInfo = new OidcUserInfo(attributes);

        return new DefaultOidcUser(
            oidcUser.getAuthorities(),
            oidcUser.getIdToken(),
            userInfo,
            "sub"
        );
    }
}
