
import { Order } from "@/types";

const API_URL = "http://localhost:4000/api/orders";

export async function removeAllOrders() {
  const response = await fetch(API_URL, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete all orders");
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return await response.json();
  } catch (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
}


export async function addOrder(order: Order) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error("Failed to add order");
  } catch (error) {
    console.error("Failed to add order:", error);
  }
}


export async function removeOrder(id: string) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete order");
}