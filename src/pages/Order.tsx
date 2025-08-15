import { useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Order, OrderItem } from "@/types";
import { addOrder } from "@/store/orders";
import { formatINR } from "@/utils/format";
import { useIsMobile } from "@/hooks/use-mobile";

export default function OrderPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: crypto.randomUUID(), name: "", qty: 1, price: 0 },
  ]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [itemSearchTerms, setItemSearchTerms] = useState<{ [key: string]: string }>({});
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>("");
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const customerInputRef = useRef<HTMLInputElement | null>(null);

  const createdAt = useMemo(() => new Date().toISOString(), []);

  const total = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

  const itemSuggestions = [
    "shirt",
    "pant",
    "t-shirt",
    "lower",
    "inner",
    "vest",
    "vesti",
    "lungi",
    "kerchief",
    "socks",
    "saree",
    "blouse",
    "white-pillow-cover",
    "white-towel",
    "white-bed-cover-double",
    "white-bed-cover-single",
    "colour-pillow-cover",
    "colour-towel",
    "colour-bed-cover-double",
    "colour-bed-cover-single",
    "double-bedcover",
    "bed-sheet",
    "colour-blanket",
    "white-blanket",
  ];

  const customerSuggestions = [
    "JK Residency Toll Plaza",
    "JK Resort",
    "JK Village Resort Ukl",
    "URC Lodge",
    "URC Resort",
    "JK Paradise",
  ];

  const filteredItemSuggestions = (itemId: string) =>
    itemSuggestions.filter((item) =>
      item.toLowerCase().includes((itemSearchTerms[itemId] || "").toLowerCase())
    );

  const filteredCustomerSuggestions = customerSuggestions.filter((customer) =>
    customer.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const addItem = () =>
    setItems((prev) => [...prev, { id: crypto.randomUUID(), name: "", qty: 1, price: 0 }]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setItemSearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[id];
      return newTerms;
    });
  };

  const updateItem = (id: string, patch: Partial<OrderItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleInputFocus = (id: string) => {
    setActiveInputId(id);
  };

  const handleCustomerInputFocus = () => {
    setActiveInputId("customer");
  };

  const handleInputChange = (id: string, value: string) => {
    setItemSearchTerms((prev) => ({ ...prev, [id]: value }));
    updateItem(id, { name: value });
  };

  const handleCustomerInputChange = (value: string) => {
    setCustomerSearchTerm(value);
    setCustomerName(value);
  };

  const handleSuggestionClick = (id: string, suggestion: string) => {
    updateItem(id, { name: suggestion });
    setItemSearchTerms((prev) => ({ ...prev, [id]: suggestion }));
    setActiveInputId(null);
    if (inputRefs.current[id]) {
      inputRefs.current[id]?.blur();
    }
  };

  const handleCustomerSuggestionClick = (suggestion: string) => {
    setCustomerName(suggestion);
    setCustomerSearchTerm(suggestion);
    setActiveInputId(null);
    if (customerInputRef.current) {
      customerInputRef.current.blur();
    }
  };

  const onPrint = async () => {
    const order: Order = {
      id: orderNumber,
      customerName,
      phone,
      createdAt,
      items: items.filter((i) => i.name.trim() !== ""),
    };
    await addOrder(order);
    navigate(`/print/${encodeURIComponent(order.id)}`, { state: { order } });
  };

  const logout = () => {
    localStorage.removeItem("vdw_auth");
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-background">
      <Seo title="New Order | Vela Dry Wash POS" description="Create a new laundry order, add items, and print an 80mm thermal receipt." canonicalPath="/order" />
      <header className="container py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">VELA DRY WASH</h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
      </header>

      <section className="container space-y-6 pb-24 md:pb-12">
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name</Label>
              <div className="relative">
                <Input
                  id="customer"
                  ref={customerInputRef}
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => handleCustomerInputChange(e.target.value)}
                  onFocus={handleCustomerInputFocus}
                  onBlur={() => setTimeout(() => setActiveInputId(null), 200)}
                />
                {activeInputId === "customer" && filteredCustomerSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-card border border-input rounded-md mt-1 shadow-lg">
                    {filteredCustomerSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                        onMouseDown={() => handleCustomerSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="Enter order number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={new Date(createdAt).toLocaleDateString()} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <CardTitle>Order Items</CardTitle>
            <Button size="sm" onClick={addItem}>+ Add Item</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="hidden md:grid grid-cols-12 text-sm font-medium text-muted-foreground">
              <div className="col-span-6">Item</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>

            <div className="space-y-3">
              {items.map((it) => {
                const amount = (Number(it.qty) || 0) * (Number(it.price) || 0);
                return (
                  <div key={it.id} className="rounded-md border bg-card p-3 md:p-0 md:border-0 relative">
                    <div className="grid gap-3 md:hidden">
                      <div className="space-y-1">
                        <Label className="text-xs">Item</Label>
                        <div className="relative">
                          <Input
                            ref={(el) => (inputRefs.current[it.id] = el)}
                            placeholder="Item name"
                            value={it.name}
                            onChange={(e) => handleInputChange(it.id, e.target.value)}
                            onFocus={() => handleInputFocus(it.id)}
                            onBlur={() => setTimeout(() => setActiveInputId(null), 200)}
                          />
                          {activeInputId === it.id && filteredItemSuggestions(it.id).length > 0 && (
                            <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-card border border-input rounded-md mt-1 shadow-lg">
                              {filteredItemSuggestions(it.id).map((suggestion) => (
                                <div
                                  key={suggestion}
                                  className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                                  onMouseDown={() => handleSuggestionClick(it.id, suggestion)}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Qty</Label>
                          <Input type="number" min={0} value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input type="number" min={0} value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">Amount</div>
                        <div className="text-base font-semibold">{formatINR(amount)}</div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="ghost" type="button" onClick={() => removeItem(it.id)}>Remove</Button>
                      </div>
                    </div>

                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6 relative">
                        <Input
                          ref={(el) => (inputRefs.current[it.id] = el)}
                          placeholder="Item name"
                          value={it.name}
                          onChange={(e) => handleInputChange(it.id, e.target.value)}
                          onFocus={() => handleInputFocus(it.id)}
                          onBlur={() => setTimeout(() => setActiveInputId(null), 200)}
                        />
                        {activeInputId === it.id && filteredItemSuggestions(it.id).length > 0 && (
                          <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-card border border-input rounded-md mt-1 shadow-lg">
                            {filteredItemSuggestions(it.id).map((suggestion) => (
                              <div
                                key={suggestion}
                                className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                                onMouseDown={() => handleSuggestionClick(it.id, suggestion)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Input className="col-span-2" type="number" value={it.qty} min={0} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                      <Input className="col-span-2" type="number" value={it.price} min={0} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })} />
                      <div className="col-span-2 text-right font-medium">{formatINR(amount)}</div>
                      <div className="col-span-12 flex justify-end">
                        <Button variant="ghost" type="button" onClick={() => removeItem(it.id)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-6">
            <div className="text-lg font-semibold">Total Amount:</div>
            <div className="text-2xl font-bold">{formatINR(total)}</div>
            <Button onClick={onPrint} className="w-full md:w-auto">Print Receipt</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
