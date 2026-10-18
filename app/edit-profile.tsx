import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import { useAvatarPicker } from "@/hooks/useAvatarPicker";
import TextField from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/Buttons";
import { BackButton } from "@/components/ui/Layout";

// Dados pessoais: nome e foto de perfil
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useApp();
  const { handleAvatarPress, isSavingAvatar } = useAvatarPicker();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const trimmed = name.trim();
  const changed = trimmed.length > 0 && trimmed !== user?.name;

  const handleSave = async () => {
    if (!trimmed) {
      Alert.alert("Erro", "Informe seu nome");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(trimmed);
      router.back();
    } catch (e) {
      console.error("Update profile error:", e);
      Alert.alert("Erro", "Nao foi possivel salvar. Verifique sua conexao.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        bottomOffset={24}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} shape="square" />
          <Text style={styles.headerTitle}>Dados pessoais</Text>
        </View>

        <Pressable
          onPress={handleAvatarPress}
          disabled={isSavingAvatar}
          style={styles.avatarWrap}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
        >
          <Avatar user={user} size={128} />
          {isSavingAvatar && (
            <View style={styles.avatarLoading}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Icon name="camera" size={18} color={Colors.onPrimary} strokeWidth={2.2} />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Toque na foto para alterar</Text>

        <View style={styles.form}>
          <TextField
            icon="user"
            label="Nome"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={80}
          />
          <TextField icon="email" label="Email" value={user?.email || ""} editable={false} />
          <Text style={styles.note}>O e-mail não pode ser alterado.</Text>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <PrimaryButton
          label="Salvar"
          trailingIcon="check"
          onPress={handleSave}
          disabled={!changed}
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  avatarWrap: {
    alignSelf: "center",
    marginTop: 32,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 64,
    backgroundColor: "rgba(17,19,24,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
  form: {
    gap: 14,
    marginTop: 28,
  },
  note: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: -4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
