// src/store/orders.ts
import * as Realm from "realm-web";
import { Order } from "@/types";

// Corrected way to access environment variables in a Vite app
const APP_ID = import.meta.env.VITE_MONGODB_APP_ID;
const DATABASE_NAME = import.meta.env.VITE_MONGODB_DATABASE_NAME;
const COLLECTION_NAME = import.meta.env.VITE_MONGODB_COLLECTION_NAME;

if (!APP_ID || !DATABASE_NAME || !COLLECTION_NAME) {
  throw new Error("Missing MongoDB environment variables");
}

const app = new Realm.App({ id: APP_ID });

// This function is the source of the error. Ensure it matches this exactly.
async function getOrdersCollection() {
  if (!app.currentUser) {
    await app.logIn(Realm.Credentials.anonymous());
  }
  const mongoClient = app.currentUser.mongoClient("mongodb-atlas");
  return mongoClient.db(DATABASE_NAME).collection<Order>(COLLECTION_NAME);
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const ordersCollection = await getOrdersCollection();
    const orders = await ordersCollection.find();
    return orders;
  } catch (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
}

export async function addOrder(order: Order) {
  try {
    const ordersCollection = await getOrdersCollection();
    await ordersCollection.insertOne(order);
  } catch (error) {
    console.error("Failed to add order:", error);
  }
}

export async function removeOrder(id: string) {
  try {
    const ordersCollection = await getOrdersCollection();
    await ordersCollection.deleteOne({ id });
  } catch (error) {
    console.error("Failed to remove order:", error);
  }
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  try {
    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({ id });
    return order;
  } catch (error) {
    console.error("Failed to get order by ID:", error);
    return undefined;
  }
}