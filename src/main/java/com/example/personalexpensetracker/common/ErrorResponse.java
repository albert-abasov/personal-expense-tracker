package com.example.personalexpensetracker.common;

import java.util.Map;

public record ErrorResponse(int status, String error, Map<String, String> details) {}
