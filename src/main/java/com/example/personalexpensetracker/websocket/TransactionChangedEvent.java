package com.example.personalexpensetracker.websocket;

import org.springframework.context.ApplicationEvent;

public class TransactionChangedEvent extends ApplicationEvent {
    private final String userId;

    public TransactionChangedEvent(Object source, String userId) {
        super(source);
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }
}
