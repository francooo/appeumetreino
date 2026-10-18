import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import type { Level } from "@/lib/storage";
import type { IconName } from "@/components/Icon";
import { PrimaryButton } from "@/components/ui/Buttons";
import { Blob, SelectionRow, Sparks, StepHeader } from "@/components/ui/Layout";

const levels: {
  level: Level;
  title: string;
  description: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
}[] = [
  {
    level: "beginner",
    title: "Iniciante",
    description: "Estou começando ou voltando",
    icon: "leaf",
    iconColor: Colors.text,
    iconBg: Colors.limeSoft,
  },
  {
    level: "intermediate",
    title: "Intermediário",
    description: "Treino há alguns meses",
    icon: "bars",
    iconColor: Colors.secondary,
    iconBg: Colors.cobaltSoft,
  },
  {
    level: "advanced",
    title: "Avançado",
    description: "Treino com consistência há mais de 1 ano",
    icon: "trophy",
    iconColor: Colors.text,
    iconBg: Colors.cobaltSoft,
  },
];

export default function LevelSelectScreen() {
  const insets = useSafeAreaInsets();
  const { level: currentLevel, setUserLevel } = useApp();
  // Vindo do Perfil: so troca o nivel e volta; no fluxo inicial segue para equipamentos
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromProfile = from === "profile";
  const [selected, setSelected] = useState<Level | null>(fromProfile ? currentLevel : null);
  const [saving, setSaving] = useState(false);

  const handleSelect = (level: Level) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelected(level);
  };

  const handleContinue = async () => {
    if (!selected) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSaving(true);
    try {
      await setUserLevel(selected);
      if (fromProfile) {
        router.back();
      } else {
        router.replace("/equipment-capture");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Blob color={Colors.secondary} lineColor={Colors.primary} style={styles.blob} />
      <Sparks color={Colors.primary} size={60} style={styles.sparksBottom} flip />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          step={1}
          total={fromProfile ? 1 : 3}
          onBack={router.canGoBack() ? () => router.back() : undefined}
        />

        <View style={styles.titleRow}>
          <Text style={styles.title}>{"Qual é o\nseu ritmo?"}</Text>
          <Sparks color={Colors.secondary} size={70} style={styles.sparksTitle} />
        </View>
        <Text style={styles.subtitle}>Vamos ajustar seus treinos ao seu momento.</Text>

        <View style={styles.options} accessibilityRole="radiogroup">
          {levels.map((item) => (
            <SelectionRow
              key={item.level}
              icon={item.icon}
              iconColor={item.iconColor}
              iconBg={item.iconBg}
              title={item.title}
              description={item.description}
              selected={selected === item.level}
              onPress={() => handleSelect(item.level)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }]}>
        <PrimaryButton
          label={fromProfile ? "Salvar" : "Continuar"}
          onPress={handleContinue}
          disabled={!selected}
          loading={saving}
          trailingIcon={fromProfile ? "check" : "arrow-right"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  titleRow: {
    marginTop: 28,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 46,
    lineHeight: 52,
    color: Colors.text,
  },
  sparksTitle: {
    position: "absolute",
    right: 0,
    top: 8,
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  options: {
    gap: 14,
  },
  footer: {
    paddingHorizontal: 20,
  },
  blob: {
    position: "absolute",
    right: -30,
    bottom: 40,
  },
  sparksBottom: {
    position: "absolute",
    left: 8,
    bottom: 150,
  },
});
