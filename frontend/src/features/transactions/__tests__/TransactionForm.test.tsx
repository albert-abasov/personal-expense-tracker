import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { TransactionForm } from "../TransactionForm";

describe("TransactionForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();
  const mockCategories = [
    { id: "cat-1", name: "Food" },
    { id: "cat-2", name: "Transport" },
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <TransactionForm
        isOpen={false}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );
    expect(screen.queryByRole("heading", { name: /transaction/i })).not.toBeInTheDocument();
  });

  it("renders the form when isOpen is true", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );
    expect(screen.getByText(/new transaction|add transaction/i)).toBeInTheDocument();
  });

  it("shows edit title when editing a transaction", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
        defaultValues={{
          id: "trans-1",
          title: "Grocery shopping",
          amount: 45.5,
          currency: "USD",
          transactionDate: new Date("2026-05-28"),
          categoryId: "cat-1",
          notes: "Weekly shop",
        }}
      />
    );
    expect(screen.getByText(/edit transaction/i)).toBeInTheDocument();
  });

  it("displays validation error for zero amount", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const titleInput = screen.getByPlaceholderText(/title|description/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);

    fireEvent.change(titleInput, { target: { value: "Test" } });
    fireEvent.change(amountInput, { target: { value: "0" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("displays validation error for negative amount", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const titleInput = screen.getByPlaceholderText(/title|description/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);

    fireEvent.change(titleInput, { target: { value: "Test" } });
    fireEvent.change(amountInput, { target: { value: "-10" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("displays validation error for empty title", async () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const amountInput = screen.getByPlaceholderText(/amount/i);
    fireEvent.change(amountInput, { target: { value: "50" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid transaction data", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const titleInput = screen.getByPlaceholderText(/title|description/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);
    const categorySelect = screen.getByRole("combobox", { name: /category/i });

    fireEvent.change(titleInput, { target: { value: "Grocery shopping" } });
    fireEvent.change(amountInput, { target: { value: "45.50" } });
    fireEvent.change(categorySelect, { target: { value: "cat-1" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Grocery shopping",
          amount: 45.5,
          categoryId: "cat-1",
        })
      );
    });
  });

  it("displays error message when provided", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
        error="Category no longer exists. Please select another."
      />
    );
    expect(
      screen.getByText("Category no longer exists. Please select another.")
    ).toBeInTheDocument();
  });

  it("closes form after successful submission", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const titleInput = screen.getByPlaceholderText(/title|description/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);
    const categorySelect = screen.getByRole("combobox", { name: /category/i });

    fireEvent.change(titleInput, { target: { value: "Test" } });
    fireEvent.change(amountInput, { target: { value: "30" } });
    fireEvent.change(categorySelect, { target: { value: "cat-1" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("allows cancelling form", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel|close/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("populates form with default values when editing", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
        defaultValues={{
          id: "trans-1",
          title: "Grocery shopping",
          amount: 45.5,
          currency: "USD",
          transactionDate: new Date("2026-05-28"),
          categoryId: "cat-1",
          notes: "Weekly shop",
        }}
      />
    );

    expect(
      screen.getByDisplayValue("Grocery shopping")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("45.5")).toBeInTheDocument();
  });

  it("displays all available categories", () => {
    render(
      <TransactionForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        categories={mockCategories}
      />
    );

    mockCategories.forEach((cat) => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    });
  });
});
