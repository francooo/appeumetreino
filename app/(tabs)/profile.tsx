import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import Avatar from "@/components/Avatar";
import Icon, { type IconName } from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import { useAvatarPicker } from "@/hooks/useAvatarPicker";
import ProgressRing from "@/components/ui/ProgressRing";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Nível iniciante",
  intermediate: "Nível intermediário",
  advanced: "Nível avançado",
};

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
    >
      <Icon name={icon} size={28} color={Colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={22} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, level, equipment, workouts, history, logout } = useApp();
  const { handleAvatarPress, isSavingAvatar } = useAvatarPicker();

  const total = Math.max(workouts.length, history.length);
  const completedRatio = total > 0 ? Math.min(history.length / total, 1) : 0;

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          await logout();
          // "/" tambem resolve para a aba Inicio; ir direto para o login e limpar a pilha
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.identity}>
        <Pressable
          onPress={handleAvatarPress}
          disabled={isSavingAvatar}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
        >
          <Avatar user={user} size={112} />
          {isSavingAvatar && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="camera" size={16} color={Colors.onPrimary} strokeWidth={2.2} />
          </View>
        </Pressable>

        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={2}>
            {user?.name || "Atleta"}
          </Text>
          <View style={styles.levelChip}>
            <Icon name="bars" size={18} color={Colors.text} strokeWidth={2.4} />
            <Text style={styles.levelText}>{LEVEL_LABEL[level || ""] || "Nível não definido"}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/edit-profile")}
            style={styles.editLink}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Icon name="edit" size={20} color={Colors.secondary} />
            <Text style={styles.editText}>Editar perfil</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
          <Icon name="run" size={34} color={Colors.success} strokeWidth={2.4} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
          <ProgressRing value={completedRatio} />
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{equipment.length}</Text>
          <Text style={styles.statLabel}>Equipamentos</Text>
          <Icon name="dumbbell" size={34} color={Colors.secondary} strokeWidth={2.6} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sua conta</Text>
      <View>
        <MenuRow icon="user" label="Dados pessoais" onPress={() => router.push("/edit-profile")} />
        <MenuRow
          icon="activity"
          label="Meu nível de treino"
          onPress={() => router.push({ pathname: "/level-select", params: { from: "profile" } })}
        />
        <MenuRow icon="dumbbell" label="Equipamentos" onPress={() => router.push("/add-equipment")} />
        <MenuRow
          icon="bell"
          label="Preferências e notificações"
          onPress={() => Alert.alert("Em breve", "Preferências e notificações estarão disponíveis em breve.")}
        />
        <MenuRow
          icon="info"
          label="Ajuda e sobre o app"
          onPress={() =>
            Alert.alert(
              "Eu me treino",
              "Versão 1.1.0\nSeu treino personalizado com o que você tem em casa.",
            )
          }
        />
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
      >
        <Icon name="logout" size={26} color={Colors.error} strokeWidth={2} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 40,
    color: Colors.text,
    marginBottom: 20,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 56,
    backgroundColor: "rgba(17,19,24,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  identityText: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 28,
    color: Colors.text,
  },
  levelChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
  },
  levelText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 32,
  },
  editText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 16,
    color: Colors.secondary,
  },
  stats: {
    flexDirection: "row",
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 34,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  statDivider: {
    width: 1,
    marginVertical: 8,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 28,
    color: Colors.text,
    marginTop: 28,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    color: Colors.text,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 60,
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 17,
    color: Colors.error,
  },
});
