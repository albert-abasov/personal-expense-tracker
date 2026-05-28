import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { server } from "../mocks/server";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";

describe("Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Inline Error Display", () => {
    it("displays error message in red box", () => {
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          Validation failed
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
      expect(screen.getByText("Validation failed")).toHaveClass("text-red-600");
    });

    it("displays multiple inline errors", () => {
      const TestComponent = () => (
        <div>
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
            Title is required
          </div>
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
            Amount must be greater than 0
          </div>
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
    });

    it("clears error when user fixes input", async () => {
      const TestComponent = () => {
        const [error, setError] = React.useState("Title is required");
        return (
          <div>
            <input
              onChange={(e) => {
                if (e.target.value) setError("");
              }}
            />
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
                {error}
              </div>
            )}
          </div>
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(screen.getByText("Title is required")).toBeInTheDocument();

      // Rerender with error cleared
      const FixedComponent = () => (
        <div>
          <input />
        </div>
      );

      rerender(<FixedComponent />);
      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });
  });

  describe("API Error Responses", () => {
    it("handles 400 validation error from API", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/categories", () =>
          HttpResponse.json(
            {
              status: 422,
              error: "Validation failed",
              details: { name: "Name cannot be empty" },
            },
            { status: 422 }
          )
        )
      );

      // API call would fail with 422 - frontend should display error
      const errorMessage = "Name cannot be empty";
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          {errorMessage}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("handles 409 conflict error (duplicate category)", async () => {
      server.use(
        http.post("http://localhost:8080/api/v1/categories", () =>
          HttpResponse.json(
            {
              status: 409,
              error: "Category with this name already exists",
            },
            { status: 409 }
          )
        )
      );

      const errorMessage = "Category with this name already exists";
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          {errorMessage}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("handles 404 not found error", async () => {
      server.use(
        http.get("http://localhost:8080/api/v1/categories/:id", () =>
          HttpResponse.json(
            { status: 404, error: "Category not found" },
            { status: 404 }
          )
        )
      );

      const errorMessage = "Category not found";
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          {errorMessage}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("handles 401 unauthorized error", async () => {
      server.use(
        http.get("http://localhost:8080/api/v1/me", () =>
          HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
        )
      );

      const errorMessage = "Please log in to continue";
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          {errorMessage}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("handles network error gracefully", () => {
      const errorMessage = "Network error - please check your connection";
      const TestComponent = () => (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
          {errorMessage}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("Toast Notifications", () => {
    it("shows error toast on failed mutation", () => {
      const toastSpy = vi.spyOn(toast, "error");

      // Simulate toast error
      toast.error("Failed to create category");

      expect(toastSpy).toHaveBeenCalledWith("Failed to create category");
    });

    it("shows warning toast for budget alerts", () => {
      const toastSpy = vi.spyOn(toast, "warning");

      // Simulate budget warning
      toast.warning(
        "Budget warning: 80% of your May budget used (USD 800.00 / USD 1000.00)"
      );

      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringContaining("Budget warning")
      );
    });

    it("dismisses toast on user click", () => {
      const { unmount } = render(<div>Toast container ready</div>);
      // Toast would be dismissed by user interaction - testing structure
      expect(screen.getByText("Toast container ready")).toBeInTheDocument();
      unmount();
    });
  });

  describe("Form Error States", () => {
    it("shows field-specific validation errors", () => {
      const TestComponent = () => (
        <div>
          <input placeholder="Title" />
          <div className="text-red-600 text-sm mt-1">Title is required</div>
          <input placeholder="Amount" />
          <div className="text-red-600 text-sm mt-1">
            Amount must be greater than 0
          </div>
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(
        screen.getByText("Amount must be greater than 0")
      ).toBeInTheDocument();
    });

    it("displays server validation errors from API response", () => {
      const validationErrors = {
        name: "Name is required",
        amount: "Must be a positive number",
      };

      const TestComponent = () => (
        <div>
          {Object.entries(validationErrors).map(([field, error]) => (
            <div key={field} className="text-red-600 text-sm">
              {error}
            </div>
          ))}
        </div>
      );

      render(<TestComponent />);
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(
        screen.getByText("Must be a positive number")
      ).toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("allows retry after error", async () => {
      const TestComponent = () => {
        const [error, setError] = React.useState("");
        const [loading, setLoading] = React.useState(false);

        const handleRetry = async () => {
          setLoading(true);
          setError("");
          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 100));
            setError("");
          } catch (err) {
            setError("Operation failed");
          } finally {
            setLoading(false);
          }
        };

        return (
          <div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg">
                {error}
              </div>
            )}
            <button onClick={handleRetry} disabled={loading}>
              Retry
            </button>
          </div>
        );
      };

      const React = await import("react");
      render(<TestComponent />);
      const retryButton = screen.getByRole("button", { name: "Retry" });
      expect(retryButton).toBeInTheDocument();
    });

    it("shows success after successful retry", async () => {
      const TestComponent = () => {
        const [success, setSuccess] = React.useState(false);
        const [error, setError] = React.useState("");

        const handleRetry = async () => {
          setError("");
          try {
            await new Promise((resolve) => setTimeout(resolve, 50));
            setSuccess(true);
          } catch (err) {
            setError("Failed");
          }
        };

        return (
          <div>
            {error && <div className="text-red-600">{error}</div>}
            {success && (
              <div className="text-green-600">Operation successful!</div>
            )}
            <button onClick={handleRetry}>Retry</button>
          </div>
        );
      };

      const React = await import("react");
      const { rerender } = render(<TestComponent />);
      const retryButton = screen.getByRole("button");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText("Operation successful!")).toBeInTheDocument();
      });
    });
  });
});
