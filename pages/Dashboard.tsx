import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadOrders, removeOrder } from "@/store/orders";
import { Order } from "@/types";
import { formatDateTime, formatINR } from "@/utils/format";
import { Link, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await loadOrders();
      setOrders(fetchedOrders);
    };
    fetchOrders();
  }, []);

  const onDelete = async (id: string) => {
    await removeOrder(id);
    const updatedOrders = await loadOrders();
    setOrders(updatedOrders);
  };

  const deleteAllOrders = async () => {
    // Note: A real implementation would have a dedicated API for this.
    // This is a simple client-side loop.
    for (const order of orders) {
      await removeOrder(order.id);
    }
    setOrders(await loadOrders());
  };

  const exportToExcel = () => {
    const data = orders.map((order) => ({
      "Order Number": order.id,
      Customer: order.customerName || "-",
      Items: order.items.length,
      Total: formatINR(order.items.reduce((s, it) => s + it.qty * it.price, 0)),
      Date: formatDateTime(order.createdAt),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Export", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Order Number", "Customer", "Items", "Total", "Date"]],
      body: orders.map((order) => [
        order.id,
        order.customerName || "-",
        order.items.length,
        formatINR(order.items.reduce((s, it) => s + it.qty * it.price, 0)),
        formatDateTime(order.createdAt),
      ]),
    });

    doc.save(`orders_export_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <main className="min-h-screen bg-background">
      <Seo title="Dashboard | Vela Dry Wash POS" description="View all transactions and reprint receipts." canonicalPath="/dashboard" />
      <header className="container py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">All Orders ({orders.length})</h1>
        <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
          <Button className="w-full md:w-auto" onClick={exportToExcel}>Export to Excel</Button>
          <Button className="w-full md:w-auto" onClick={exportToPDF}>Export to PDF</Button>
          <Button className="w-full md:w-auto" variant="secondary" onClick={() => navigate("/order")}>New Order</Button>
          <Button className="w-full md:w-auto" variant="outline" onClick={() => navigate("/login")}>Back</Button>
        </div>
      </header>

      <section className="container pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {orders.map((o) => {
                  const total = o.items.reduce((s, it) => s + it.qty * it.price, 0);
                  return (
                    <Card key={o.id} className="border">
                      <CardContent className="py-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{o.id}</span>
                          <span className="text-sm text-muted-foreground">{formatDateTime(o.createdAt)}</span>
                        </div>
                        <div className="text-sm">Customer: {o.customerName || "-"}</div>
                        <div className="text-sm">Items: {o.items.length}</div>
                        <div className="text-base font-medium">Total: {formatINR(total)}</div>
                        <div className="pt-2 grid grid-cols-2 gap-2">
                          <Button size="sm" className="w-full" asChild>
                            <Link to={`/print/${encodeURIComponent(o.id)}`}>Print</Link>
                          </Button>
                          <Button size="sm" className="w-full" variant="destructive" onClick={() => onDelete(o.id)}>Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {orders.length === 0 && (
                  <div className="py-6 text-center text-muted-foreground">No orders yet. Create your first one.</div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 pr-4">Order Number</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Items</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-0 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const total = o.items.reduce((s, it) => s + it.qty * it.price, 0);
                      return (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{o.id}</td>
                          <td className="py-2 pr-4">{o.customerName || "-"}</td>
                          <td className="py-2 pr-4">{o.items.length}</td>
                          <td className="py-2 pr-4">{formatINR(total)}</td>
                          <td className="py-2 pr-4">{formatDateTime(o.createdAt)}</td>
                          <td className="py-2 pr-0 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" asChild>
                                <Link to={`/print/${encodeURIComponent(o.id)}`}>Print</Link>
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => onDelete(o.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">No orders yet. Create your first one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {orders.length > 0 && (
              <div className="mt-4">
                <Button size="sm" variant="destructive" onClick={deleteAllOrders}>Delete All</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}