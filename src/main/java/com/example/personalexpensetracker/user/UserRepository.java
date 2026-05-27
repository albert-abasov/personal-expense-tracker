package com.example.personalexpensetracker.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByProviderAndProviderUserId(String provider, String providerUserId);

    Optional<User> findByEmail(String email);
}
