import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Request camera permissions
 */
export async function requestCameraPermissions(): Promise<boolean> {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    }
    return true;
}

/**
 * Take a photo using the camera
 */
export async function takePhoto(): Promise<string | null> {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
        console.log('Camera permission not granted');
        return null;
    }

    try {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7, // Compress for faster upload
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            return result.assets[0].uri;
        }
        return null;
    } catch (error) {
        console.error('Failed to take photo:', error);
        return null;
    }
}

/**
 * Pick an image from the gallery
 */
export async function pickImage(): Promise<string | null> {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            return result.assets[0].uri;
        }
        return null;
    } catch (error) {
        console.error('Failed to pick image:', error);
        return null;
    }
}

/**
 * Upload proof of delivery image
 */
export async function uploadProofImage(orderId: number, imageUri: string): Promise<string | null> {
    try {
        const storedAuth = await AsyncStorage.getItem('@deliverease_auth');
        const headers: Record<string, string> = {};

        if (storedAuth) {
            const user = JSON.parse(storedAuth);
            if (user?.id) {
                headers['x-user-id'] = String(user.id);
            }
        }

        // Create form data for image upload
        const formData = new FormData();
        const filename = `proof_${orderId}_${Date.now()}.jpg`;

        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: filename,
        } as any);
        formData.append('orderId', String(orderId));

        const response = await fetch(`${BASE_URL}/api/orders/${orderId}/proof`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.proofImageUrl;
    } catch (error) {
        console.error('Failed to upload proof image:', error);
        return null;
    }
}
