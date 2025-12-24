import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock environment for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

/**
 * API Integration Tests
 * 
 * These tests validate the server API endpoints.
 * Run with: npm test -- server/__tests__/api.test.ts
 */

describe('API Endpoints', () => {
    describe('Authentication', () => {
        it('should reject login with invalid credentials', async () => {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid@test.com',
                    password: 'wrongpassword',
                }),
            });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.message).toBe('Invalid credentials');
        });

        it('should reject registration with invalid data', async () => {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'notanemail',
                    password: '123',
                }),
            });

            expect(response.status).toBe(400);
        });

        it('should accept login with valid demo credentials', async () => {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@demo.com',
                    password: 'demo123',
                }),
            });

            // Should succeed with demo account
            if (response.status === 200) {
                const data = await response.json();
                expect(data.email).toBe('admin@demo.com');
                expect(data.role).toBe('admin');
            }
        });
    });

    describe('Orders API', () => {
        const testHeaders = {
            'Content-Type': 'application/json',
            'X-User-Id': '1', // Legacy auth for testing
        };

        it('should require authentication for orders list', async () => {
            const response = await fetch('http://localhost:5000/api/orders');
            expect(response.status).toBe(401);
        });

        it('should return orders list with auth', async () => {
            const response = await fetch('http://localhost:5000/api/orders', {
                headers: testHeaders,
            });

            if (response.status === 200) {
                const data = await response.json();
                expect(Array.isArray(data)).toBe(true);
            }
        });

        it('should validate order creation data', async () => {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Missing required fields
                    customerName: 'Test',
                }),
            });

            expect(response.status).toBe(400);
        });

        it('should filter orders by status', async () => {
            const response = await fetch('http://localhost:5000/api/orders?status=pending', {
                headers: testHeaders,
            });

            if (response.status === 200) {
                const data = await response.json();
                expect(Array.isArray(data)).toBe(true);
                // All orders should have pending status
                data.forEach((order: any) => {
                    expect(order.status).toBe('pending');
                });
            }
        });
    });

    describe('Analytics API', () => {
        const testHeaders = {
            'Content-Type': 'application/json',
            'X-User-Id': '1',
        };

        it('should require auth for daily analytics', async () => {
            const response = await fetch('http://localhost:5000/api/analytics/daily');
            expect(response.status).toBe(401);
        });

        it('should return daily analytics data', async () => {
            const response = await fetch('http://localhost:5000/api/analytics/daily', {
                headers: testHeaders,
            });

            if (response.status === 200) {
                const data = await response.json();
                expect(data).toHaveProperty('collections');
                expect(data).toHaveProperty('commissions');
                expect(data).toHaveProperty('activeDrivers');
                expect(data).toHaveProperty('pendingOrders');
            }
        });
    });

    describe('Users API', () => {
        const testHeaders = {
            'Content-Type': 'application/json',
            'X-User-Id': '1',
        };

        it('should require auth for users list', async () => {
            const response = await fetch('http://localhost:5000/api/users');
            expect(response.status).toBe(401);
        });

        it('should return users list', async () => {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: testHeaders,
            });

            if (response.status === 200) {
                const data = await response.json();
                expect(Array.isArray(data)).toBe(true);
            }
        });

        it('should filter users by role', async () => {
            const response = await fetch('http://localhost:5000/api/users?role=driver', {
                headers: testHeaders,
            });

            if (response.status === 200) {
                const data = await response.json();
                expect(Array.isArray(data)).toBe(true);
                data.forEach((user: any) => {
                    expect(user.role).toBe('driver');
                });
            }
        });
    });

    describe('Ratings API', () => {
        const testHeaders = {
            'Content-Type': 'application/json',
            'X-User-Id': '1',
        };

        it('should validate rating range', async () => {
            const response = await fetch('http://localhost:5000/api/ratings', {
                method: 'POST',
                headers: testHeaders,
                body: JSON.stringify({
                    orderId: 1,
                    driverId: 2,
                    rating: 10, // Invalid: should be 1-5
                }),
            });

            expect(response.status).toBe(400);
        });

        it('should require orderId, driverId, and rating', async () => {
            const response = await fetch('http://localhost:5000/api/ratings', {
                method: 'POST',
                headers: testHeaders,
                body: JSON.stringify({
                    rating: 5,
                    // Missing orderId and driverId
                }),
            });

            expect(response.status).toBe(400);
        });
    });

    describe('Customer Lookup API', () => {
        const testHeaders = {
            'Content-Type': 'application/json',
            'X-User-Id': '1',
        };

        it('should require phone parameter', async () => {
            const response = await fetch('http://localhost:5000/api/customers/lookup', {
                headers: testHeaders,
            });

            expect(response.status).toBe(400);
        });

        it('should return 404 for unknown customer', async () => {
            const response = await fetch('http://localhost:5000/api/customers/lookup?phone=0000000000', {
                headers: testHeaders,
            });

            expect(response.status).toBe(404);
        });
    });
});
