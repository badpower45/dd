import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

interface SyncOperation {
  id: string;
  type: "create" | "update" | "delete";
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

/**
 * Offline Sync Manager
 * Handles synchronization of offline operations when connection is restored
 */
class OfflineSyncManager {
  private syncInProgress = false;
  private listeners: Array<(status: string) => void> = [];

  async init() {
    // Monitor network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.syncInProgress) {
        this.syncPendingOperations();
      }
    });
  }

  /**
   * Add operation to sync queue
   */
  async addOperation(
    type: "create" | "update" | "delete",
    table: string,
    data: any,
  ): Promise<void> {
    const operations = await this.getPendingOperations();
    const newOp: SyncOperation = {
      id: Date.now().toString(),
      type,
      table,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    operations.push(newOp);
    await AsyncStorage.setItem("sync_queue", JSON.stringify(operations));
  }

  /**
   * Get pending operations
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    try {
      const stored = await AsyncStorage.getItem("sync_queue");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting pending operations:", error);
      return [];
    }
  }

  /**
   * Sync all pending operations
   */
  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    this.notifyListeners("syncing");

    try {
      const operations = await this.getPendingOperations();
      const unsynced = operations.filter((op) => !op.synced);

      for (const op of unsynced) {
        await this.executeOperation(op);
        op.synced = true;
      }

      // Remove synced operations
      const remaining = operations.filter((op) => !op.synced);
      await AsyncStorage.setItem("sync_queue", JSON.stringify(remaining));

      this.notifyListeners("synced");
    } catch (error) {
      console.error("Sync failed:", error);
      this.notifyListeners("error");
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Execute single operation
   */
  private async executeOperation(op: SyncOperation): Promise<void> {
    try {
      switch (op.type) {
        case "create":
          await supabase.from(op.table).insert(op.data);
          break;
        case "update":
          await supabase.from(op.table).update(op.data).eq("id", op.data.id);
          break;
        case "delete":
          await supabase.from(op.table).delete().eq("id", op.data.id);
          break;
      }
    } catch (error) {
      console.error(`Failed to execute ${op.type} on ${op.table}:`, error);
      throw error;
    }
  }

  /**
   * Add sync status listener
   */
  addListener(callback: (status: string) => void) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (status: string) => void) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(status: string) {
    this.listeners.forEach((cb) => cb(status));
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    await this.syncPendingOperations();
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    pendingCount: number;
    lastSync: number | null;
    isSyncing: boolean;
  }> {
    const operations = await this.getPendingOperations();
    const lastSyncStr = await AsyncStorage.getItem("last_sync");
    const lastSync = lastSyncStr ? parseInt(lastSyncStr) : null;

    return {
      pendingCount: operations.filter((op) => !op.synced).length,
      lastSync,
      isSyncing: this.syncInProgress,
    };
  }

  /**
   * Clear all pending operations (use with caution!)
   */
  async clearPendingOperations(): Promise<void> {
    await AsyncStorage.removeItem("sync_queue");
  }
}

export const offlineSyncManager = new OfflineSyncManager();
