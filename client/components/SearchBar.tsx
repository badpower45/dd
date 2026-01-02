import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  I18nManager,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { debounce } from "@/lib/performance";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  value = "",
  autoFocus = false,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState(value);

  // Debounced search with 300ms delay
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, 300),
    [onSearch],
  );

  const handleChange = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setSearchText("");
    onSearch("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <Search size={20} color={theme.textSecondary} />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            textAlign: I18nManager.isRTL ? "right" : "left",
          },
        ]}
        value={searchText}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchText.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={theme.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xs,
  },
});
