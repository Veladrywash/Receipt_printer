import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Order } from "@/types";
import { getOrderById } from "@/store/orders";
import { formatINR } from "@/utils/format";
import "@/styles/print.css";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";

export default function PrintPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | undefined)?.order;

  const [order, setOrder] = useState<Order | undefined>(stateOrder);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!stateOrder && id) {
        const fetchedOrder = await getOrderById(id);
        setOrder(fetchedOrder);
      }
    };
    fetchOrder();
  }, [id, stateOrder]);

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => window.print(), 200);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Seo title="Print Preview | Vela Dry Wash POS" description="80mm thermal receipt preview." canonicalPath={/print/${id ?? ""}} />
        <div className="space-y-4 text-center">
          <p>No order data found.</p>
          <Button onClick={() => navigate("/order")}>Back to Order</Button>
        </div>
      </main>
    );
  }

  const total = order.items.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <main className="min-h-screen flex flex-col items-center py-2">
      <Seo title={Print: ${order.id} | Vela Dry Wash POS} description="80mm thermal receipt preview." canonicalPath={/print/${order.id}} />
      <div className="receipt-root">
        <div className="receipt-center">
          <div className="receipt-title">VELA DRY WASH</div>
          <div className="receipt-small receipt-muted">Fully Mechanised Laundry Enterprise</div>
          <div className="receipt-small">Arasa Thottam, Sellipalayam,</div>
          <div className="receipt-small">Uthukuli - 638 751</div>
          <div className="receipt-small">Mob: 95664 42121</div>
        </div>

        <hr className="receipt-hr" />

        <div className="receipt-small">Date: {new Date(order.createdAt).toLocaleString()}</div>
        <div className="receipt-small">Order: {order.id}</div>
        <div className="receipt-small">Customer: {order.customerName || "-"}</div>

        <hr className="receipt-hr" />

        <div className="items receipt-small">
          <div className="item">
            <div><strong>Item</strong></div>
            <div className="num"><strong>Qty</strong></div>
            <div className="num"><strong>Price</strong></div>
            <div className="num"><strong>Total</strong></div>
          </div>
          <hr className="receipt-hr" />
          {order.items.map((it) => (
            <div className="item" key={it.id}>
              <div>{it.name || "-"}</div>
              <div className="num">{it.qty}</div>
              <div className="num">{formatINR(it.price)}</div>
              <div className="num">{formatINR(it.qty * it.price)}</div>
            </div>
          ))}
        </div>

        <hr className="receipt-hr" />

        <div className="total-row">
          <div>Total:</div>
          <div>{formatINR(total)}</div>
        </div>

        <hr className="receipt-hr" />
        <div className="receipt-center receipt-small">Thank you!</div>
      </div>

      <div className="no-print mt-4 flex gap-2">
        <Button onClick={() => window.print()}>Print</Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    </main>
  );
}
