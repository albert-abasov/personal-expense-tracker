package com.example.personalexpensetracker.category;

import com.example.personalexpensetracker.auth.CustomOAuth2User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> list(Authentication authentication) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(categoryService.list(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getOne(
        Authentication authentication,
        @PathVariable String id) {
        String userId = extractUserId(authentication);
        return ResponseEntity.ok(categoryService.getOne(userId, id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
        Authentication authentication,
        @Valid @RequestBody CreateCategoryRequest request) {
        String userId = extractUserId(authentication);
        CategoryResponse response = categoryService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
        Authentication authentication,
        @PathVariable String id,
        @Valid @RequestBody UpdateCategoryRequest request) {
        String userId = extractUserId(authentication);
        CategoryResponse response = categoryService.update(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
        Authentication authentication,
        @PathVariable String id) {
        String userId = extractUserId(authentication);
        categoryService.delete(userId, id);
    }

    private String extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomOAuth2User) {
            return ((CustomOAuth2User) principal).getUserId();
        } else if (principal instanceof OidcUser) {
            return (String) ((OidcUser) principal).getAttributes().get("userId");
        }

        throw new IllegalStateException("Unable to extract user ID from authentication");
    }
}
