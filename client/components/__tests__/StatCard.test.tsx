import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";
import { StatCard } from "../StatCard";

// Mock theme hook
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      primary: "#0D9488",
      backgroundDefault: "#FFFFFF",
      border: "#E2E8F0",
      textSecondary: "#64748B",
    },
  }),
}));

// Mock reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.View = View;
  return Reanimated;
});

describe("StatCard Component", () => {
  it("renders correctly with value and label", () => {
    const { getByText } = render(
      <StatCard value={42} label="الطلبات" icon={<Text>📦</Text>} />,
    );

    expect(getByText("٤٢")).toBeTruthy(); // Arabic numerals
    expect(getByText("الطلبات")).toBeTruthy();
  });

  it("renders string values correctly", () => {
    const { getByText } = render(
      <StatCard value="100" label="إحصائية" icon={<Text>📊</Text>} />,
    );

    expect(getByText("100")).toBeTruthy();
  });

  it("renders icon", () => {
    const { getByText } = render(
      <StatCard value={10} label="Test" icon={<Text testID="icon">🚀</Text>} />,
    );

    expect(getByText("🚀")).toBeTruthy();
  });
});
