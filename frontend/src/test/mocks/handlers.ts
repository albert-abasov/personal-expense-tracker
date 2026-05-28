import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const handlers = [
  // Auth endpoints
  http.get(`${API_BASE_URL}/me`, () => {
    return HttpResponse.json({
      id: "test-user-123",
      email: "test@example.com",
      displayName: "Test User",
      provider: "google",
      avatarUrl: "https://example.com/avatar.jpg",
    });
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Category endpoints
  http.get(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json([
      { id: "cat-1", name: "Food", createdAt: new Date().toISOString() },
      { id: "cat-2", name: "Transport", createdAt: new Date().toISOString() },
    ]);
  }),

  http.post(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json(
      { id: "cat-new", name: "New Category", createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.get(`${API_BASE_URL}/categories/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: "Test Category",
      createdAt: new Date().toISOString(),
    });
  }),

  http.patch(`${API_BASE_URL}/categories/:id`, () => {
    return HttpResponse.json({
      id: "cat-1",
      name: "Updated Category",
      createdAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_BASE_URL}/categories/:id`, () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Transaction endpoints
  http.get(`${API_BASE_URL}/transactions`, () => {
    return HttpResponse.json({
      data: [
        {
          id: "trans-1",
          title: "Grocery Shopping",
          amount: 45.5,
          currency: "USD",
          transactionDate: "2026-05-28",
          categoryId: "cat-1",
          categoryName: "Food",
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 0,
      size: 20,
      total: 1,
    });
  }),

  http.post(`${API_BASE_URL}/transactions`, () => {
    return HttpResponse.json(
      {
        id: "trans-new",
        title: "New Transaction",
        amount: 50.0,
        currency: "USD",
        transactionDate: "2026-05-28",
        categoryId: "cat-1",
        categoryName: "Food",
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get(`${API_BASE_URL}/transactions/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: "Test Transaction",
      amount: 30.0,
      currency: "USD",
      transactionDate: "2026-05-28",
      categoryId: "cat-1",
      categoryName: "Food",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.patch(`${API_BASE_URL}/transactions/:id`, () => {
    return HttpResponse.json({
      id: "trans-1",
      title: "Updated Transaction",
      amount: 40.0,
      currency: "USD",
      transactionDate: "2026-05-28",
      categoryId: "cat-1",
      categoryName: "Food",
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_BASE_URL}/transactions/:id`, () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Budget endpoints
  http.get(`${API_BASE_URL}/budgets/:year/:month`, ({ params }) => {
    return HttpResponse.json({
      id: "budget-1",
      userId: "test-user-123",
      year: parseInt(params.year as string),
      month: parseInt(params.month as string),
      amount: 1000.0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE_URL}/budgets/:year/:month/summary`, ({ params }) => {
    return HttpResponse.json({
      year: parseInt(params.year as string),
      month: parseInt(params.month as string),
      currency: "USD",
      budgetAmount: 1000.0,
      totalSpent: 500.0,
      remaining: 500.0,
      usagePercent: 50.0,
      hasBudget: true,
    });
  }),

  http.put(`${API_BASE_URL}/budgets/:year/:month`, () => {
    return HttpResponse.json({
      id: "budget-1",
      userId: "test-user-123",
      year: 2026,
      month: 5,
      amount: 1500.0,
      currency: "USD",
      createdAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_BASE_URL}/budgets/:year/:month`, () => {
    return HttpResponse.json(null, { status: 204 });
  }),
];
