import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon as NativeIcon, Label } from "expo-router/unstable-native-tabs";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeIcon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Início</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <NativeIcon sf={{ default: "list.bullet", selected: "list.bullet" }} />
        <Label>Treinos</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calories">
        <NativeIcon sf={{ default: "flame", selected: "flame.fill" }} />
        <Label>Calorias</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeIcon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Perfil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function tabOptions(title: string, icon: IconName) {
  return {
    title,
    tabBarAccessibilityLabel: title,
    tabBarIcon: ({ color }: { color: string }) => (
      <Icon name={icon} size={26} color={color} strokeWidth={2} />
    ),
    tabBarLabel: ({ color, focused }: { color: string; focused: boolean }) => (
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color }, focused && styles.labelFocused]}>
          {title}
        </Text>
        <View style={[styles.indicator, focused && { backgroundColor: color }]} />
      </View>
    ),
  };
}

function ClassicTabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          height: (isWeb ? 0 : insets.bottom) + 72,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={tabOptions("Início", "home")} />
      <Tabs.Screen name="workouts" options={tabOptions("Treinos", "list")} />
      <Tabs.Screen name="calories" options={tabOptions("Calorias", "fire")} />
      <Tabs.Screen name="profile" options={tabOptions("Perfil", "user")} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  labelWrap: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
  },
  labelFocused: {
    fontFamily: "Rubik_600SemiBold",
  },
  indicator: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
});
