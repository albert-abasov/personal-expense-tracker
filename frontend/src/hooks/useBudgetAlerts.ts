import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { ServerMessage, BudgetAlertMessage } from '../types/websocket';

const MAX_RETRIES = 5;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildToastMessage(msg: BudgetAlertMessage): string {
  const month = MONTH_NAMES[msg.month - 1] ?? String(msg.month);
  const spent = `${msg.currency} ${msg.totalSpent.toFixed(2)}`;
  const budget = `${msg.currency} ${msg.budgetAmount.toFixed(2)}`;
  switch (msg.threshold) {
    case 50:
      return `Budget notice: 50% of your ${month} budget used (${spent} / ${budget})`;
    case 80:
      return `Budget warning: 80% of your ${month} budget used (${spent} / ${budget})`;
    case 100:
      return `Budget exceeded: You've gone over your ${month} budget! (${spent} / ${budget})`;
  }
}

export function useBudgetAlerts(enabled: boolean) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // setTimeout defers the connection by one macrotask so that React
    // StrictMode's synchronous unmount can set `cancelled = true` and
    // clearTimeout before the WebSocket is ever created.
    const initTimeout = setTimeout(connect, 0);

    function connect() {
      if (cancelled) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws/budget-alerts`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCount.current = 0;
        ws.send(JSON.stringify({ type: 'SUBSCRIBE' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: ServerMessage = JSON.parse(event.data);
          if (msg.type === 'BUDGET_ALERT') {
            const text = buildToastMessage(msg);
            if (msg.threshold === 100) {
              toast.error(text);
            } else {
              toast.warning(text);
            }
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        if (retryCount.current < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount.current) * 1000;
          retryCount.current += 1;
          retryTimeout.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    return () => {
      cancelled = true;
      clearTimeout(initTimeout);
      if (retryTimeout.current != null) {
        clearTimeout(retryTimeout.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled]);
}
