import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import type { Level } from "@/lib/storage";

interface LevelOption {
  level: Level;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
}

const levels: LevelOption[] = [
  {
    level: "beginner",
    title: "Iniciante",
    description: "Comecando agora ou voltando a treinar",
    icon: "leaf",
    gradient: ["#4CAF50", "#66BB6A"],
  },
  {
    level: "intermediate",
    title: "Intermediario",
    description: "Treino regularmente ha alguns meses",
    icon: "flame",
    gradient: ["#FF9800", "#FFA726"],
  },
  {
    level: "advanced",
    title: "Avancado",
    description: "Treino consistente ha mais de 1 ano",
    icon: "trophy",
    gradient: ["#E91E63", "#F06292"],
  },
];

export default function LevelSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setUserLevel } = useApp();

  const handleSelect = async (level: Level) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await setUserLevel(level);
    router.replace("/equipment-capture");
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 20,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Qual seu nivel{"\n"}de experiencia?</Text>
        <Text style={styles.subtitle}>
          Vamos adaptar seu treino ao seu nivel atual
        </Text>
      </View>

      <View style={styles.cards}>
        {levels.map((item) => (
          <Pressable
            key={item.level}
            onPress={() => handleSelect(item.level)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <LinearGradient
                colors={item.gradient}
                style={styles.cardIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={item.icon} size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    gap: 8,
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Rubik_600SemiBold",
    color: Colors.text,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
  },
});
