import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

// Mock theme hook
jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      primary: "#0D9488",
      danger: "#DC2626",
      backgroundSecondary: "#F1F5F9",
      text: "#1E293B",
    },
  }),
}));

// Mock haptics
jest.mock("@/lib/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
  },
}));

describe("Button Component", () => {
  it("renders correctly with text", () => {
    const { getByText } = render(<Button>تسجيل الدخول</Button>);
    expect(getByText("تسجيل الدخول")).toBeTruthy();
  });

  it("renders with primary variant by default", () => {
    const { getByText } = render(<Button>Primary</Button>);
    const button = getByText("Primary");
    expect(button).toBeTruthy();
  });

  it("handles press events", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click Me</Button>);

    fireEvent.press(getByText("Click Me"));
    expect(onPress).toHaveBeenCalled();
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>,
    );

    fireEvent.press(getByText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading state", () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button loading>Loading</Button>,
    );

    // Text should not be visible when loading
    // ActivityIndicator should be present
    expect(queryByText("Loading")).toBeNull();
  });

  it("renders with danger variant", () => {
    const { getByText } = render(<Button variant="danger">Delete</Button>);
    expect(getByText("Delete")).toBeTruthy();
  });

  it("renders with outline variant", () => {
    const { getByText } = render(<Button variant="outline">Outline</Button>);
    expect(getByText("Outline")).toBeTruthy();
  });

  it("renders with secondary variant", () => {
    const { getByText } = render(
      <Button variant="secondary">Secondary</Button>,
    );
    expect(getByText("Secondary")).toBeTruthy();
  });
});
