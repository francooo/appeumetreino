import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native";
import Svg, { Path, Ellipse, Rect, G } from "react-native-svg";
import Colors from "@/constants/colors";

interface MuscleMapProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

const INACTIVE_COLOR = "#2D3A4F";

const MUSCLE_ALIASES: Record<string, string[]> = {
  peito: ["peito", "peitoral", "chest", "pectorals"],
  ombros: ["ombros", "ombro", "deltoides", "deltoide", "shoulders", "deltoids"],
  biceps: ["bíceps", "biceps", "bicep"],
  abdomen: ["abdômen", "abdomen", "abdominal", "abs", "core"],
  quadriceps: ["quadríceps", "quadriceps", "quads"],
  antebracos: ["antebraços", "antebracos", "forearms", "forearm"],
  costas_superiores: ["costas superiores", "costas", "dorsais", "dorsal", "upper back", "trapézio", "trapezio", "trapezius", "latissimus", "latíssimo"],
  costas_inferiores: ["costas inferiores", "lombar", "lower back", "erector spinae"],
  triceps: ["tríceps", "triceps", "tricep"],
  gluteos: ["glúteos", "gluteos", "glutes", "gluteus"],
  isquiotibiais: ["isquiotibiais", "posterior de coxa", "hamstrings", "hamstring"],
  panturrilhas: ["panturrilhas", "panturrilha", "calves", "calf"],
};

function getMuscleKey(muscleName: string): string | null {
  const lower = muscleName.toLowerCase().trim();
  for (const [key, aliases] of Object.entries(MUSCLE_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias) || alias.includes(lower))) {
      return key;
    }
  }
  return null;
}

function getMuscleColor(
  muscleKey: string,
  primaryMuscles: string[],
  secondaryMuscles: string[]
): string {
  const allPrimary = primaryMuscles.map(getMuscleKey).filter(Boolean);
  const allSecondary = secondaryMuscles.map(getMuscleKey).filter(Boolean);

  if (allPrimary.includes(muscleKey)) return Colors.primary;
  if (allSecondary.includes(muscleKey)) return Colors.secondary;
  return INACTIVE_COLOR;
}

function FrontBody({
  primaryMuscles,
  secondaryMuscles,
}: MuscleMapProps) {
  const c = (key: string) => getMuscleColor(key, primaryMuscles, secondaryMuscles);

  return (
    <Svg width="180" height="340" viewBox="0 0 180 340">
      <Ellipse cx="90" cy="28" rx="20" ry="24" fill="#3A4560" />

      <Path
        d="M72 52 L60 56 L48 72 L44 100 L50 100 L56 80 L64 68 L72 60 Z"
        fill={c("ombros")}
      />
      <Path
        d="M108 52 L120 56 L132 72 L136 100 L130 100 L124 80 L116 68 L108 60 Z"
        fill={c("ombros")}
      />

      <Path
        d="M72 60 L72 110 L90 115 L108 110 L108 60 L100 54 L80 54 Z"
        fill={c("peito")}
      />

      <Path
        d="M44 100 L40 140 L46 140 L50 100 Z"
        fill={c("biceps")}
      />
      <Path
        d="M136 100 L140 140 L134 140 L130 100 Z"
        fill={c("biceps")}
      />

      <Path
        d="M38 142 L34 172 L42 172 L46 142 Z"
        fill={c("antebracos")}
      />
      <Path
        d="M142 142 L146 172 L138 172 L134 142 Z"
        fill={c("antebracos")}
      />

      <Path
        d="M72 112 L72 170 L90 175 L108 170 L108 112 L90 117 Z"
        fill={c("abdomen")}
      />

      <Rect x="76" y="118" width="28" height="2" rx="1" fill="rgba(0,0,0,0.25)" />
      <Rect x="76" y="130" width="28" height="2" rx="1" fill="rgba(0,0,0,0.25)" />
      <Rect x="76" y="142" width="28" height="2" rx="1" fill="rgba(0,0,0,0.25)" />
      <Rect x="76" y="154" width="28" height="2" rx="1" fill="rgba(0,0,0,0.25)" />
      <Rect x="89" y="117" width="2" height="52" rx="1" fill="rgba(0,0,0,0.2)" />

      <Path
        d="M68 172 L60 240 L72 244 L82 244 L90 178 Z"
        fill={c("quadriceps")}
      />
      <Path
        d="M112 172 L120 240 L108 244 L98 244 L90 178 Z"
        fill={c("quadriceps")}
      />

      <Path
        d="M60 248 L58 300 L72 300 L72 248 Z"
        fill="#3A4560"
      />
      <Path
        d="M108 248 L110 300 L96 300 L96 248 Z"
        fill="#3A4560"
      />

      <Path
        d="M56 302 L54 330 L74 330 L74 302 Z"
        fill="#3A4560"
      />
      <Path
        d="M112 302 L114 330 L94 330 L94 302 Z"
        fill="#3A4560"
      />
    </Svg>
  );
}

function BackBody({
  primaryMuscles,
  secondaryMuscles,
}: MuscleMapProps) {
  const c = (key: string) => getMuscleColor(key, primaryMuscles, secondaryMuscles);

  return (
    <Svg width="180" height="340" viewBox="0 0 180 340">
      <Ellipse cx="90" cy="28" rx="20" ry="24" fill="#3A4560" />

      <Path
        d="M72 52 L60 56 L48 72 L44 100 L50 100 L56 80 L64 68 L72 60 Z"
        fill="#3A4560"
      />
      <Path
        d="M108 52 L120 56 L132 72 L136 100 L130 100 L124 80 L116 68 L108 60 Z"
        fill="#3A4560"
      />

      <Path
        d="M72 54 L72 90 L90 95 L108 90 L108 54 L100 50 L80 50 Z"
        fill={c("costas_superiores")}
      />

      <Path
        d="M76 92 L76 130 L90 135 L104 130 L104 92 L90 97 Z"
        fill={c("costas_inferiores")}
      />

      <Path
        d="M44 100 L40 140 L46 140 L50 100 Z"
        fill={c("triceps")}
      />
      <Path
        d="M136 100 L140 140 L134 140 L130 100 Z"
        fill={c("triceps")}
      />

      <Path
        d="M38 142 L34 172 L42 172 L46 142 Z"
        fill="#3A4560"
      />
      <Path
        d="M142 142 L146 172 L138 172 L134 142 Z"
        fill="#3A4560"
      />

      <Path
        d="M68 132 L68 175 L90 180 L112 175 L112 132 L90 137 Z"
        fill={c("gluteos")}
      />

      <Path
        d="M64 178 L58 250 L72 252 L82 250 L88 182 Z"
        fill={c("isquiotibiais")}
      />
      <Path
        d="M116 178 L122 250 L108 252 L98 250 L92 182 Z"
        fill={c("isquiotibiais")}
      />

      <Path
        d="M56 254 L54 310 L72 310 L72 254 Z"
        fill={c("panturrilhas")}
      />
      <Path
        d="M108 254 L114 310 L96 310 L96 254 Z"
        fill={c("panturrilhas")}
      />

      <Path
        d="M52 312 L50 335 L76 335 L76 312 Z"
        fill="#3A4560"
      />
      <Path
        d="M110 312 L118 335 L92 335 L92 312 Z"
        fill="#3A4560"
      />
    </Svg>
  );
}

export default function MuscleMap({ primaryMuscles, secondaryMuscles }: MuscleMapProps) {
  const [view, setView] = useState<"front" | "back">("front");

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "front" && styles.toggleBtnActive]}
          onPress={() => setView("front")}
        >
          <Text style={[styles.toggleText, view === "front" && styles.toggleTextActive]}>
            Frente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "back" && styles.toggleBtnActive]}
          onPress={() => setView("back")}
        >
          <Text style={[styles.toggleText, view === "back" && styles.toggleTextActive]}>
            Costas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        {view === "front" ? (
          <FrontBody primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} />
        ) : (
          <BackBody primaryMuscles={primaryMuscles} secondaryMuscles={secondaryMuscles} />
        )}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendLabel}>Primário</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.legendLabel}>Secundário</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: INACTIVE_COLOR }]} />
          <Text style={styles.legendLabel}>Inativo</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  bodyContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 350,
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
