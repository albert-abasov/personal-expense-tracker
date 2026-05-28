package com.example.personalexpensetracker.category;

import com.example.personalexpensetracker.common.NotFoundException;
import com.example.personalexpensetracker.testutil.BaseControllerTest;
import com.example.personalexpensetracker.testutil.SecurityTestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CategoryAuthorizationTest extends BaseControllerTest {

    @MockitoBean
    private CategoryService categoryService;

    private String user1Id = "user-1";
    private String user2Id = "user-2";
    private String category1Id = UUID.randomUUID().toString();

    @Test
    void testUser1CannotReadUser2sCategory() throws Exception {
        when(categoryService.getOne(user2Id, category1Id))
                .thenThrow(new NotFoundException("Category not found"));

        mockMvc.perform(get("/api/v1/categories/" + category1Id)
                .with(SecurityTestUtils.withUser(user2Id)))
                .andExpect(status().isNotFound());

        verify(categoryService, times(1)).getOne(user2Id, category1Id);
    }

    @Test
    void testUser1CannotUpdateUser2sCategory() throws Exception {
        UpdateCategoryRequest request = new UpdateCategoryRequest("Hacked Category");

        when(categoryService.update(user2Id, category1Id, request))
                .thenThrow(new NotFoundException("Category not found"));

        mockMvc.perform(patch("/api/v1/categories/" + category1Id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request))
                .with(SecurityTestUtils.withUser(user2Id)))
                .andExpect(status().isNotFound());

        verify(categoryService, times(1)).update(user2Id, category1Id, request);
    }

    @Test
    void testDifferentUsersHaveIsolatedData() throws Exception {
        String user1Category = UUID.randomUUID().toString();
        String user2Category = UUID.randomUUID().toString();

        CategoryResponse user1Response = new CategoryResponse(user1Category, "Food", Instant.now());
        CategoryResponse user2Response = new CategoryResponse(user2Category, "Transport", Instant.now());

        when(categoryService.getOne(user1Id, user1Category)).thenReturn(user1Response);
        when(categoryService.getOne(user1Id, user2Category)).thenThrow(new NotFoundException("Category not found"));
        when(categoryService.getOne(user2Id, user2Category)).thenReturn(user2Response);
        when(categoryService.getOne(user2Id, user1Category)).thenThrow(new NotFoundException("Category not found"));

        mockMvc.perform(get("/api/v1/categories/" + user1Category)
                .with(SecurityTestUtils.withUser(user1Id)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/categories/" + user2Category)
                .with(SecurityTestUtils.withUser(user1Id)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/categories/" + user2Category)
                .with(SecurityTestUtils.withUser(user2Id)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/categories/" + user1Category)
                .with(SecurityTestUtils.withUser(user2Id)))
                .andExpect(status().isNotFound());
    }
}
