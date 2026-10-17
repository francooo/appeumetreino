import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import Colors from "@/constants/colors";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, level, equipment, workouts, history, logout, updateAvatar } = useApp();
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const saveAvatar = async (uri: string) => {
    setIsSavingAvatar(true);
    try {
      // Reduz para 400x400 JPEG (~30-60 KB) antes de enviar e salvar no banco
      const result = await manipulateAsync(uri, [{ resize: { width: 400, height: 400 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!result.base64) throw new Error("Falha ao processar a imagem");
      await updateAvatar(`data:image/jpeg;base64,${result.base64}`);
    } catch (e) {
      console.error("Avatar error:", e);
      Alert.alert("Erro", "Nao foi possivel salvar a foto. Tente novamente.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const pickAvatar = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        source === "camera"
          ? "Permita o acesso a camera para tirar a foto."
          : "Permita o acesso as fotos para escolher uma imagem.",
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]?.uri) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    const buttons: { text: string; style?: "cancel" | "destructive"; onPress?: () => void }[] = [
      { text: "Tirar foto", onPress: () => pickAvatar("camera") },
      { text: "Escolher da galeria", onPress: () => pickAvatar("library") },
    ];
    if (user?.avatar) {
      buttons.push({
        text: "Remover foto",
        style: "destructive",
        onPress: async () => {
          setIsSavingAvatar(true);
          try {
            await updateAvatar(null);
          } catch {
            Alert.alert("Erro", "Nao foi possivel remover a foto.");
          } finally {
            setIsSavingAvatar(false);
          }
        },
      });
    }
    buttons.push({ text: "Cancelar", style: "cancel" });
    Alert.alert("Foto de perfil", undefined, buttons);
  };

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

  const levelLabel =
    level === "beginner"
      ? "Iniciante"
      : level === "intermediate"
        ? "Intermediario"
        : level === "advanced"
          ? "Avancado"
          : "Nao definido";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.profileCard}>
        <Pressable
          onPress={handleAvatarPress}
          disabled={isSavingAvatar}
          style={({ pressed }) => [styles.profileAvatar, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
        >
          <Avatar
            user={user}
            size={96}
            backgroundColor={Colors.primary}
            textColor={Colors.onPrimary}
          />
          {isSavingAvatar && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="camera" size={16} color={Colors.onPrimary} strokeWidth={2.2} />
          </View>
        </Pressable>
        <Text style={styles.profileName}>{user?.name || "Atleta"}</Text>
        <Text style={styles.profileEmail}>{user?.email || ""}</Text>
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>{levelLabel}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Completos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{equipment.length}</Text>
          <Text style={styles.statLabel}>Equipamentos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipamentos cadastrados</Text>
        {equipment.length > 0 ? (
          <View style={styles.equipmentList}>
            {equipment.map((item) => (
              <View key={item.id} style={styles.equipmentChip}>
                <Ionicons name="fitness" size={14} color={Colors.primary} />
                <Text style={styles.equipmentChipText}>{item.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum equipamento cadastrado</Text>
        )}
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          label="Editar perfil"
          onPress={() => {}}
        />
        <MenuItem
          icon="fitness-outline"
          label="Alterar nivel"
          onPress={() => router.push("/level-select")}
        />
        <MenuItem
          icon="barbell-outline"
          label="Gerenciar equipamentos"
          onPress={() => router.push("/add-equipment")}
        />
        <MenuItem
          icon="information-circle-outline"
          label="Sobre o app"
          onPress={() =>
            Alert.alert(
              "Eu me treino",
              "Versao 1.0.0\nSeu treino personalizado com o que voce tem em casa.",
            )
          }
        />
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && styles.logoutBtnPressed,
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "Rubik_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: 24,
  },
  profileCard: {
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    marginBottom: 4,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: "rgba(17,19,24,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  profileEmail: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.limeSoft,
    marginTop: 4,
  },
  levelChipText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  equipmentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  equipmentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipmentChipText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  menuSection: {
    marginBottom: 24,
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLabel: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.error,
  },
});
