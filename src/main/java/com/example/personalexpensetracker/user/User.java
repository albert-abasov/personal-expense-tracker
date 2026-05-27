package com.example.personalexpensetracker.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_user_id"})
})
public class User {
    @Id
    private String id;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(name = "provider_user_id", nullable = false, length = 128)
    private String providerUserId;

    @Column(length = 255)
    private String email;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
