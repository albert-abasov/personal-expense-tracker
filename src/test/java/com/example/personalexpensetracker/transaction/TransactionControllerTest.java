package com.example.personalexpensetracker.transaction;

import com.example.personalexpensetracker.common.PageResponse;
import com.example.personalexpensetracker.testutil.SecurityTestUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class TransactionControllerTest {

    @Autowired
    private WebApplicationContext wac;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TransactionService transactionService;

    private MockMvc mockMvc;
    private String userId = "test-user-123";
    private String categoryId = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(wac).apply(springSecurity()).build();
        SecurityTestUtils.clearSecurityContext();
    }

    @Test
    void testListTransactionsWithPagination() throws Exception {
        String transactionId = UUID.randomUUID().toString();
        TransactionResponse transaction = new TransactionResponse(
                transactionId,
                categoryId,
                "Groceries",
                "Shopping",
                new BigDecimal("30.00"),
                "USD",
                LocalDate.now(),
                null,
                Instant.now(),
                Instant.now()
        );

        PageResponse<TransactionResponse> pageResponse = new PageResponse<>(
                List.of(transaction),
                0,
                20,
                1
        );

        when(transactionService.list(eq(userId), any(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/transactions?page=0&size=20")
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.page", is(0)))
                .andExpect(jsonPath("$.total", is(1)));

        verify(transactionService, times(1)).list(eq(userId), any(), any());
    }

    @Test
    void testGetTransactionReturnsNotFoundWhenNotExists() throws Exception {
        String transactionId = UUID.randomUUID().toString();
        when(transactionService.getOne(userId, transactionId))
                .thenThrow(new com.example.personalexpensetracker.common.NotFoundException("Transaction not found"));

        mockMvc.perform(get("/api/v1/transactions/" + transactionId)
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isNotFound());

        verify(transactionService, times(1)).getOne(userId, transactionId);
    }

    @Test
    void testDeleteTransactionSuccess() throws Exception {
        String transactionId = UUID.randomUUID().toString();

        mockMvc.perform(delete("/api/v1/transactions/" + transactionId)
                .with(SecurityTestUtils.withUser(userId)))
                .andExpect(status().isNoContent());

        verify(transactionService, times(1)).delete(userId, transactionId);
    }

    @Test
    void testUnauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/transactions"))
                .andExpect(status().isUnauthorized());
    }
}
