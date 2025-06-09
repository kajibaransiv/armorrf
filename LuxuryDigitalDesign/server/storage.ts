import { 
  users, products, contactMessages, newsletterSubscriptions, cartItems, chatMessages, orders,
  type User, type InsertUser, type Product, type InsertProduct,
  type ContactMessage, type InsertContactMessage,
  type NewsletterSubscription, type InsertNewsletterSubscription,
  type CartItem, type InsertCartItem, type ChatMessage, type InsertChatMessage,
  type Order, type InsertOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Contact message methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<void>;
  
  // Chat methods
  getChatMessages(sessionId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(id: number): Promise<void>;
  getUnreadMessagesCount(): Promise<number>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize database with sample data if needed
    this.initializeProducts();
  }

  private async initializeProducts() {
    try {
      // Check if products already exist
      const existingProducts = await db.select().from(products);
      if (existingProducts.length === 0) {
        // Insert the EMF Hoodie product
        await db.insert(products).values({
          name: "The EMF Hoodie",
          description: "Engineered for the modern urbanite who refuses to compromise between style and wellness. This revolutionary garment seamlessly blends German precision engineering with sustainable luxury, creating the ultimate shield against electromagnetic pollution.",
          price: 24700, // $247 in cents
          material: "100% Organic Cotton",
          protection: "Silverell® Fiber Weave",
          origin: "German Engineering",
          effectiveness: "99.9% EMF Blocking",
          sizes: ["S", "M", "L", "XL"],
          images: [
            "/attached_assets/Gemini_Generated_Image_eihd6weihd6weihd_1749325046518.png",
            "/attached_assets/image-232x348_1749315669548.jpg",
            "/attached_assets/image-232x348_1749315669548.jpg",
            "/attached_assets/image-232x348_1749315669548.jpg"
          ],
          inStock: true,
        });
      }
    } catch (error) {
      console.error("Failed to initialize products:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  // Contact message methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const [item] = await db
      .insert(cartItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  // Chat methods
  async getChatMessages(sessionId?: string): Promise<ChatMessage[]> {
    if (sessionId) {
      return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId));
    }
    return await db.select().from(chatMessages);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, id));
  }

  async getUnreadMessagesCount(): Promise<number> {
    const result = await db.select().from(chatMessages).where(eq(chatMessages.isRead, false));
    return result.length;
  }

  // Order methods
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ARF-${timestamp}-${random}`;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const [order] = await db
      .insert(orders)
      .values({ ...insertOrder, orderNumber })
      .returning();
    return order;
  }

  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order || undefined;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }
}

export const storage = new DatabaseStorage();
