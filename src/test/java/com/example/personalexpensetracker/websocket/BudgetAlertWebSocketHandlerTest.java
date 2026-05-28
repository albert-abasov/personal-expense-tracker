package com.example.personalexpensetracker.websocket;

import com.example.personalexpensetracker.budget.BudgetSummaryResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class BudgetAlertWebSocketHandlerTest {

    @Mock
    private com.example.personalexpensetracker.budget.MonthlyBudgetService budgetService;

    private ObjectMapper objectMapper = new ObjectMapper();
    private String userId = "test-user-123";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testBudgetAlertMessageAt50PercentThreshold() {
        int year = 2026;
        int month = 5;

        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                year, month, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("50.00"),
                new BigDecimal("50.00"),
                50.0,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(50, summary);

        assertEquals("BUDGET_ALERT", alert.type());
        assertEquals(50, alert.threshold());
        assertEquals(50.0, alert.usagePercent());
        assertEquals(new BigDecimal("50.00"), alert.totalSpent());
        assertEquals(new BigDecimal("100.00"), alert.budgetAmount());
        assertEquals("USD", alert.currency());
        assertEquals(year, alert.year());
        assertEquals(month, alert.month());
    }

    @Test
    void testBudgetAlertMessageAt80PercentThreshold() {
        int year = 2026;
        int month = 5;

        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                year, month, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("80.00"),
                new BigDecimal("20.00"),
                80.0,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(80, summary);

        assertEquals(80, alert.threshold());
        assertEquals(80.0, alert.usagePercent());
        assertEquals(new BigDecimal("80.00"), alert.totalSpent());
    }

    @Test
    void testBudgetAlertMessageAt100PercentThreshold() {
        int year = 2026;
        int month = 5;

        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                year, month, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("100.00"),
                new BigDecimal("0.00"),
                100.0,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(100, summary);

        assertEquals(100, alert.threshold());
        assertEquals(100.0, alert.usagePercent());
        assertEquals(new BigDecimal("100.00"), alert.totalSpent());
    }

    @Test
    void testConnectedMessageHasCorrectType() {
        BudgetAlertMessage connected = BudgetAlertMessage.connected();

        assertEquals("CONNECTED", connected.type());
        assertNull(connected.threshold());
        assertNull(connected.usagePercent());
        assertNull(connected.totalSpent());
        assertNull(connected.budgetAmount());
        assertNull(connected.currency());
        assertNull(connected.year());
        assertNull(connected.month());
    }

    @Test
    void testAlertMessageCanBeSerialized() throws Exception {
        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                2026, 5, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("75.00"),
                new BigDecimal("25.00"),
                75.0,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(80, summary);
        String json = objectMapper.writeValueAsString(alert);

        assertTrue(json.contains("BUDGET_ALERT"));
        assertTrue(json.contains("80"));
        assertTrue(json.contains("USD"));
        assertTrue(json.contains("75.00"));
    }

    @Test
    void testExceeding100PercentBudget() {
        // Scenario where spending exceeds budget
        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                2026, 5, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("150.00"),
                new BigDecimal("-50.00"),
                150.0,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(100, summary);

        assertTrue(alert.usagePercent() > 100.0);
        assertTrue(alert.totalSpent().compareTo(alert.budgetAmount()) > 0);
    }

    @Test
    void testAlertMessageStructureIsValid() {
        BudgetSummaryResponse summary = new BudgetSummaryResponse(
                2026, 5, "USD",
                new BigDecimal("100.00"),
                new BigDecimal("45.50"),
                new BigDecimal("54.50"),
                45.5,
                true
        );

        BudgetAlertMessage alert = BudgetAlertMessage.alert(50, summary);

        assertEquals(50, alert.threshold());
        assertEquals(45.5, alert.usagePercent());
        assertEquals(new BigDecimal("45.50"), alert.totalSpent());
        assertEquals(new BigDecimal("100.00"), alert.budgetAmount());
        assertEquals("USD", alert.currency());
        assertEquals(2026, alert.year());
        assertEquals(5, alert.month());
    }
}
