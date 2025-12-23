import { z } from 'zod';

/**
 * Server-side validation schemas using Zod
 * These provide additional security and data integrity checks
 */

// Egyptian phone number validation
const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

export const phoneSchema = z.string()
    .transform(val => val.replace(/[\s-]/g, ''))
    .refine(val => egyptianPhoneRegex.test(val), {
        message: 'رقم الهاتف غير صحيح',
    });

// Email validation with sanitization
export const emailSchema = z.string()
    .email('البريد الإلكتروني غير صحيح')
    .transform(val => val.toLowerCase().trim());

// Positive amount in cents (must be positive integer)
export const amountSchema = z.number()
    .int('المبلغ يجب أن يكون عدداً صحيحاً')
    .positive('المبلغ يجب أن يكون موجباً')
    .max(100000000, 'المبلغ كبير جداً'); // Max 1M EGP

// Address validation (not empty, reasonable length)
export const addressSchema = z.string()
    .min(10, 'العنوان قصير جداً')
    .max(500, 'العنوان طويل جداً')
    .transform(val => val.trim());

// Name validation
export const nameSchema = z.string()
    .min(2, 'الاسم قصير جداً')
    .max(100, 'الاسم طويل جداً')
    .transform(val => val.trim());

// GPS coordinates validation
export const latSchema = z.string()
    .refine(val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
    }, 'خط العرض غير صحيح');

export const lngSchema = z.string()
    .refine(val => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
    }, 'خط الطول غير صحيح');

// Order creation validation (strict)
export const createOrderValidation = z.object({
    restaurantId: z.number().int().positive(),
    customerName: nameSchema,
    customerPhone: phoneSchema,
    deliveryAddress: addressSchema,
    deliveryLat: latSchema.optional(),
    deliveryLng: lngSchema.optional(),
    collectionAmount: amountSchema,
    deliveryFee: amountSchema,
});

// User update validation
export const updateUserValidation = z.object({
    fullName: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    currentLat: latSchema.optional(),
    currentLng: lngSchema.optional(),
    pushToken: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'يجب تحديد حقل واحد على الأقل للتحديث',
});

// Sanitize text to prevent XSS
export function sanitizeText(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

// Validate and parse request with error handling
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return { success: false, errors: result.error.errors };
}
