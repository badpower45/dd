import * as XLSX from "xlsx";
import { Share, Platform } from "react-native";
import type { Order } from "@/lib/types";

/**
 * Export orders to Excel file
 * Note: For React Native, file system operations should be handled
 * by the native side or using react-native-fs
 */
export async function exportToExcel(
  orders: Order[],
  filename: string = "orders",
): Promise<void> {
  try {
    // Prepare data for export
    const data = orders.map((order) => ({
      "Order ID": order.id,
      "Customer Name": order.customerName,
      "Customer Phone": order.phonePrimary,
      "Delivery Address": order.customerAddress,
      Status: order.status,
      "Collection Amount": order.collectionAmount / 100,
      "Delivery Fee": order.deliveryFee / 100,
      "Created At": new Date(order.createdAt).toLocaleString("ar-EG"),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Generate Excel file
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    // For web, trigger download
    if (Platform.OS === "web") {
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For mobile, use Share API with base64 data
      await Share.share({
        message: `Export: ${filename}`,
        title: "Export Orders",
      });
    }

    return;
  } catch (error) {
    console.error("Export to Excel failed:", error);
    throw error;
  }
}

/**
 * Export orders to CSV file
 */
export async function exportToCSV(
  orders: Order[],
  filename: string = "orders",
): Promise<void> {
  try {
    // Prepare CSV content
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Delivery Address",
      "Status",
      "Collection Amount",
      "Delivery Fee",
      "Created At",
    ];

    const rows = orders.map((order) => [
      order.id,
      order.customerName,
      order.phonePrimary,
      order.customerAddress,
      order.status,
      order.collectionAmount / 100,
      order.deliveryFee / 100,
      new Date(order.createdAt).toLocaleString("ar-EG"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // For web, trigger download
    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For mobile, use Share API
      await Share.share({
        message: csvContent,
        title: "Export Orders CSV",
      });
    }

    return;
  } catch (error) {
    console.error("Export to CSV failed:", error);
    throw error;
  }
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number): string {
  return (amount / 100).toFixed(2);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
