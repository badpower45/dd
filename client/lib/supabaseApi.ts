/**
 * Supabase Direct API Layer
 * This replaces the Express.js backend by calling Supabase directly
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { compare, hash } from 'bcryptjs';

// Types
export interface User {
    id: number;
    email: string;
    password: string;
    role: 'admin' | 'dispatcher' | 'restaurant' | 'driver';
    full_name: string;
    phone_number: string | null;
    balance: number;
    current_lat: string | null;
    current_lng: string | null;
    push_token: string | null;
    created_at: string;
}

export interface Order {
    id: number;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    delivery_lat: string | null;
    delivery_lng: string | null;
    restaurant_id: number;
    driver_id: number | null;
    status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
    collection_amount: number;
    delivery_fee: number;
    delivery_window: string | null;
    picked_at: string | null;
    delivered_at: string | null;
    proof_image_url: string | null;
    notes: string | null;
    dispatcher_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: string;
    description: string | null;
    created_at: string;
}

export interface Rating {
    id: number;
    order_id: number;
    driver_id: number;
    restaurant_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
}

// Auth API
export const supabaseApi = {
    auth: {
        async login(email: string, password: string): Promise<User> {
            if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) throw new Error('Invalid credentials');

            const isValid = await compare(password, user.password);
            if (!isValid) throw new Error('Invalid credentials');

            return user;
        },

        async register(userData: Partial<User> & { password: string }): Promise<User> {
            if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

            const hashedPassword = await hash(userData.password, 10);

            const { data: user, error } = await supabase
                .from('users')
                .insert({ ...userData, password: hashedPassword })
                .select()
                .single();

            if (error) throw new Error(error.message);
            return user;
        },
    },

    users: {
        async get(id: number): Promise<User> {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw new Error(error.message);
            return data;
        },

        async list(role?: string): Promise<User[]> {
            let query = supabase.from('users').select('*');
            if (role) query = query.eq('role', role);

            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data || [];
        },

        async update(id: number, updates: Partial<User>): Promise<User> {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },

        async updateLocation(id: number, lat: string, lng: string): Promise<User> {
            return this.update(id, { current_lat: lat, current_lng: lng });
        },
    },

    orders: {
        async create(order: Partial<Order>): Promise<Order> {
            const { data, error } = await supabase
                .from('orders')
                .insert(order)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },

        async get(id: number): Promise<Order> {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw new Error(error.message);
            return data;
        },

        async list(filters?: { restaurantId?: number; driverId?: number; status?: string }): Promise<Order[]> {
            let query = supabase.from('orders').select('*');

            if (filters?.restaurantId) query = query.eq('restaurant_id', filters.restaurantId);
            if (filters?.driverId) query = query.eq('driver_id', filters.driverId);
            if (filters?.status) query = query.eq('status', filters.status);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data || [];
        },

        async update(id: number, updates: Partial<Order>): Promise<Order> {
            // Handle status-specific timestamps
            if (updates.status === 'picked_up' && !updates.picked_at) {
                updates.picked_at = new Date().toISOString();
            }
            if (updates.status === 'delivered' && !updates.delivered_at) {
                updates.delivered_at = new Date().toISOString();
            }
            updates.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);

            // If delivered, create transactions
            if (updates.status === 'delivered' && data.driver_id) {
                await this.processDeliveryTransaction(data);
            }

            return data;
        },

        async processDeliveryTransaction(order: Order): Promise<void> {
            // Add delivery fee to driver's balance
            if (order.driver_id) {
                const { data: driver } = await supabase
                    .from('users')
                    .select('balance')
                    .eq('id', order.driver_id)
                    .single();

                if (driver) {
                    await supabase
                        .from('users')
                        .update({ balance: driver.balance + order.delivery_fee })
                        .eq('id', order.driver_id);

                    await supabase.from('transactions').insert({
                        user_id: order.driver_id,
                        amount: order.delivery_fee,
                        type: 'commission',
                        description: `Delivery fee for order #${order.id}`,
                    });
                }
            }

            // Add collection to restaurant's balance
            const { data: restaurant } = await supabase
                .from('users')
                .select('balance')
                .eq('id', order.restaurant_id)
                .single();

            if (restaurant) {
                await supabase
                    .from('users')
                    .update({ balance: restaurant.balance + order.collection_amount })
                    .eq('id', order.restaurant_id);

                await supabase.from('transactions').insert({
                    user_id: order.restaurant_id,
                    amount: order.collection_amount,
                    type: 'payment',
                    description: `Collection for order #${order.id}`,
                });
            }
        },

        async getPending(): Promise<Order[]> {
            return this.list({ status: 'pending' });
        },
    },

    transactions: {
        async list(userId?: number): Promise<Transaction[]> {
            let query = supabase.from('transactions').select('*');
            if (userId) query = query.eq('user_id', userId);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data || [];
        },
    },

    ratings: {
        async create(rating: Partial<Rating>): Promise<Rating> {
            const { data, error } = await supabase
                .from('ratings')
                .insert(rating)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },

        async getByDriver(driverId: number): Promise<{ ratings: Rating[]; average: number; count: number }> {
            const { data, error } = await supabase
                .from('ratings')
                .select('*')
                .eq('driver_id', driverId);

            if (error) throw new Error(error.message);

            const ratings = data || [];
            const average = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;

            return { ratings, average: Math.round(average * 10) / 10, count: ratings.length };
        },
    },

    drivers: {
        async getActive(): Promise<User[]> {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'driver')
                .not('current_lat', 'is', null);

            if (error) throw new Error(error.message);
            return data || [];
        },
    },

    analytics: {
        async getRestaurantStats(restaurantId: number): Promise<{ todayOrders: number; totalCollection: number; activeDeliveries: number }> {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .gte('created_at', today.toISOString());

            const todayOrders = orders?.length || 0;
            const totalCollection = orders?.filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + o.collection_amount, 0) || 0;
            const activeDeliveries = orders?.filter(o => ['pending', 'assigned', 'picked_up'].includes(o.status)).length || 0;

            return { todayOrders, totalCollection, activeDeliveries };
        },

        async getDailyStats(): Promise<{ collections: number; commissions: number; pendingOrders: number; activeDrivers: number }> {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .gte('created_at', today.toISOString());

            const collections = transactions?.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0) || 0;
            const commissions = transactions?.filter(t => t.type === 'commission').reduce((sum, t) => sum + t.amount, 0) || 0;

            const { data: pendingOrders } = await supabase
                .from('orders')
                .select('id')
                .eq('status', 'pending');

            const { data: drivers } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'driver');

            return {
                collections,
                commissions,
                pendingOrders: pendingOrders?.length || 0,
                activeDrivers: drivers?.length || 0,
            };
        },
    },

    customers: {
        async lookup(phone: string): Promise<{ name: string; address: string; lat?: number; lng?: number } | null> {
            const { data, error } = await supabase
                .from('orders')
                .select('customer_name, delivery_address, delivery_lat, delivery_lng')
                .eq('customer_phone', phone)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error || !data) return null;

            return {
                name: data.customer_name,
                address: data.delivery_address,
                lat: data.delivery_lat ? parseFloat(data.delivery_lat) : undefined,
                lng: data.delivery_lng ? parseFloat(data.delivery_lng) : undefined,
            };
        },
    },
};

export default supabaseApi;
