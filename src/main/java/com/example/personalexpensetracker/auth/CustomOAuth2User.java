package com.example.personalexpensetracker.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final OAuth2User delegate;
    private final String userId;

    public CustomOAuth2User(Map<String, Object> attributes, Collection<? extends GrantedAuthority> authorities, String userId) {
        this(attributes, authorities, userId, "id");
    }

    public CustomOAuth2User(Map<String, Object> attributes, Collection<? extends GrantedAuthority> authorities, String userId, String nameAttributeKey) {
        this.delegate = new org.springframework.security.oauth2.core.user.DefaultOAuth2User(authorities, attributes, nameAttributeKey);
        this.userId = userId;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return userId;
    }

    public String getUserId() {
        return userId;
    }
}
