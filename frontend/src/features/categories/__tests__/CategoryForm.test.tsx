import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { CategoryForm } from "../CategoryForm";

describe("CategoryForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <CategoryForm
        isOpen={false}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByRole("heading", { name: /category/i })).not.toBeInTheDocument();
  });

  it("renders the form when isOpen is true", () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("New Category")).toBeInTheDocument();
  });

  it("shows edit title when editing an existing category", () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        defaultValues={{ id: "cat-1", name: "Food" }}
      />
    );
    expect(screen.getByText("Edit Category")).toBeInTheDocument();
  });

  it("populates form with default values when editing", async () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        defaultValues={{ id: "cat-1", name: "Groceries" }}
      />
    );
    const input = screen.getByDisplayValue("Groceries") as HTMLInputElement;
    expect(input.value).toBe("Groceries");
  });

  it("submits form with category name", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Entertainment" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Entertainment",
      });
    });
  });

  it("trims whitespace from category name", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "  Travel  " } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Travel",
      });
    });
  });

  it("displays error message when provided", () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        error="Category name already exists"
      />
    );
    expect(screen.getByText("Category name already exists")).toBeInTheDocument();
  });

  it("closes form after successful submission", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Food" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows loading state during submission", async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Food" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    fireEvent.click(submitButton);

    // Submit button should show loading state
    expect(submitButton).toHaveAttribute("disabled");

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("clears form when closed and reopened", async () => {
    const { rerender } = render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Entertainment" } });
    expect(input.value).toBe("Entertainment");

    // Close form
    rerender(
      <CategoryForm
        isOpen={false}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Reopen form - should be cleared
    rerender(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const newInput = screen.getByPlaceholderText("Category name") as HTMLInputElement;
    expect(newInput.value).toBe("");
  });

  it("disables submit button when name is empty", () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("enables submit button when name is filled", async () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "Food" } });

    const submitButton = screen.getByRole("button", { name: /save|create/i });
    expect(submitButton).not.toHaveAttribute("disabled");
  });

  it("allows cancelling form", () => {
    render(
      <CategoryForm
        isOpen={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel|close/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
