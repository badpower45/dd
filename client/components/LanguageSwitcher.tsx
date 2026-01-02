import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import * as Updates from "expo-updates";
import { Globe } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const currentLanguage = i18n.language;

  const switchLanguage = async () => {
    const newLang = currentLanguage === "ar" ? "en" : "ar";
    await i18n.changeLanguage(newLang);

    // Reload app to apply RTL changes
    try {
      await Updates.reloadAsync();
    } catch (error) {
      // Fallback if reload fails - just change language
      console.log("Reload not available, language changed without reload");
    }
  };

  return (
    <Pressable
      onPress={switchLanguage}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Globe size={18} color={theme.text} />
      <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
        {currentLanguage === "ar" ? "English" : "عربي"}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
