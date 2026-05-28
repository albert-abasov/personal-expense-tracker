package com.example.personalexpensetracker.category;

import com.example.personalexpensetracker.testutil.SecurityTestUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class CategoryControllerTest {

    @Autowired
    private WebApplicationContext wac;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CategoryService categoryService;

    private MockMvc mockMvc;
    private String userId = "test-user-123";
    private String categoryId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity()).build();
        SecurityTestUtils.clearSecurityContext();
    }

    @Test
    void testListCategoriesSuccess() throws Exception {
        String cat1Id = UUID.randomUUID().toString();
        String cat2Id = UUID.randomUUID().toString();
        CategoryResponse cat1 = new CategoryResponse(cat1Id, "Food", Instant.now());
        CategoryResponse cat2 = new CategoryResponse(cat2Id, "Transport", Instant.now());

        when(categoryService.list(userId)).thenReturn(List.of(cat1, cat2));

        mockMvc.perform(get("/api/v1/categories")
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Food")))
                .andExpect(jsonPath("$[1].name", is("Transport")));

        verify(categoryService, times(1)).list(userId);
    }

    @Test
    void testGetCategorySuccess() throws Exception {
        CategoryResponse response = new CategoryResponse(categoryId, "Groceries", Instant.now());

        when(categoryService.getOne(userId, categoryId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/categories/" + categoryId)
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Groceries")));

        verify(categoryService, times(1)).getOne(userId, categoryId);
    }

    @Test
    void testDeleteCategorySuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/categories/" + categoryId)
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isNoContent());

        verify(categoryService, times(1)).delete(userId, categoryId);
    }

    @Test
    void testGetCategoryReturnsNotFoundWhenNotExists() throws Exception {
        when(categoryService.getOne(userId, categoryId))
                .thenThrow(new com.example.personalexpensetracker.common.NotFoundException("Category not found"));

        mockMvc.perform(get("/api/v1/categories/" + categoryId)
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isNotFound());

        verify(categoryService, times(1)).getOne(userId, categoryId);
    }

    @Test
    void testUnauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isUnauthorized());
    }
}
