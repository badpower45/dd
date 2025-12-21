import { Platform } from "react-native";

const getBaseUrl = () => {
    if (Platform.OS === "web") {
        // Use absolute path for API calls on web
        return window.location.origin;
    }
    // For Android emulator use 10.0.2.2, for iOS simulator use localhost
    // If running on physical device, replace with your machine's local IP
    return Platform.OS === "android"
        ? "http://10.0.2.2:5000"
        : "http://localhost:5000";
};

export const BASE_URL = getBaseUrl();

export const apiRequest = async (
    method: string,
    path: string,
    body?: unknown
) => {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    const config: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetch(`${BASE_URL}${path}`, config);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "API Request Failed");
    }

    return res.json();
};

export const api = {
    auth: {
        login: (body: any) => apiRequest("POST", "/api/auth/login", body),
        register: (body: any) => apiRequest("POST", "/api/auth/register", body),
    },
    users: {
        get: (id: number) => apiRequest("GET", `/api/users/${id}`),
        list: (role?: string) => apiRequest("GET", `/api/users${role ? `?role=${role}` : ""}`),
    },
    orders: {
        list: (filters?: Record<string, any>) => {
            const params = new URLSearchParams(filters);
            return apiRequest("GET", `/api/orders?${params.toString()}`);
        },
        create: (body: any) => apiRequest("POST", "/api/orders", body),
        update: (id: number, body: any) => apiRequest("PATCH", `/api/orders/${id}`, body),
    },
    drivers: {
        updateLocation: (userId: number, lat: number, lng: number) =>
            apiRequest("POST", "/api/drivers/location", { userId, lat: String(lat), lng: String(lng) }),
        getActive: () => apiRequest("GET", "/api/drivers/active"),
    },
    transactions: {
        list: (userId: number) => apiRequest("GET", `/api/transactions?userId=${userId}`),
    },
    analytics: {
        getDaily: (date?: Date) => {
            const dateStr = date ? date.toISOString() : "";
            return apiRequest("GET", `/api/analytics/daily${dateStr ? `?date=${dateStr}` : ""}`);
        }
    }
};
