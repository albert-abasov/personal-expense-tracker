package com.example.personalexpensetracker.websocket;

import com.example.personalexpensetracker.auth.CustomOAuth2User;
import com.example.personalexpensetracker.budget.BudgetSummaryResponse;
import com.example.personalexpensetracker.budget.MonthlyBudgetService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.security.Principal;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetAlertWebSocketHandler extends TextWebSocketHandler {

    private static final List<Integer> THRESHOLDS = List.of(50, 80, 100);
    private static final String USER_ID_ATTR = "userId";

    private final MonthlyBudgetService budgetService;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionUsers = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<Integer>> sentThresholds = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserId(session);
        if (userId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        session.getAttributes().put(USER_ID_ATTR, userId);
        sessions.put(session.getId(), session);
        sessionUsers.put(session.getId(), userId);
        sentThresholds.put(session.getId(), ConcurrentHashMap.newKeySet());

        sendMessage(session, BudgetAlertMessage.connected());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode node = objectMapper.readTree(message.getPayload());
            String type = node.path("type").asText();
            if ("SUBSCRIBE".equals(type)) {
                computeAndPush(session);
            }
        } catch (Exception e) {
            log.warn("Failed to parse WebSocket message from session {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        sessionUsers.remove(session.getId());
        sentThresholds.remove(session.getId());
    }

    @EventListener
    public void onTransactionChanged(TransactionChangedEvent event) {
        String userId = event.getUserId();
        for (var entry : sessionUsers.entrySet()) {
            if (userId.equals(entry.getValue())) {
                WebSocketSession session = sessions.get(entry.getKey());
                if (session != null && session.isOpen()) {
                    try {
                        computeAndPush(session);
                    } catch (Exception e) {
                        log.warn("Failed to push budget alert to session {}: {}", session.getId(), e.getMessage());
                    }
                }
            }
        }
    }

    private void computeAndPush(WebSocketSession session) throws IOException {
        String userId = (String) session.getAttributes().get(USER_ID_ATTR);
        if (userId == null) return;

        YearMonth now = YearMonth.now();
        BudgetSummaryResponse summary = budgetService.getBudgetSummary(userId, now.getYear(), now.getMonthValue());

        if (!summary.hasBudget()) return;

        Set<Integer> sent = sentThresholds.get(session.getId());
        if (sent == null) return;

        double usage = summary.usagePercent() != null ? summary.usagePercent() : 0.0;
        for (int threshold : THRESHOLDS) {
            if (usage >= threshold && sent.add(threshold)) {
                sendMessage(session, BudgetAlertMessage.alert(threshold, summary));
            }
        }
    }

    private void sendMessage(WebSocketSession session, BudgetAlertMessage message) throws IOException {
        String json = objectMapper.writeValueAsString(message);
        synchronized (session) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

    private String extractUserId(WebSocketSession session) {
        Principal principal = session.getPrincipal();
        if (principal instanceof Authentication auth) {
            Object p = auth.getPrincipal();
            if (p instanceof CustomOAuth2User user) {
                return user.getUserId();
            }
            if (p instanceof OidcUser oidcUser) {
                Object userId = oidcUser.getAttributes().get("userId");
                return userId != null ? userId.toString() : null;
            }
        }
        return null;
    }
}
