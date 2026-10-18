import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Path } from "react-native-svg";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import TextField from "@/components/ui/TextField";
import { GoogleButton, PrimaryButton } from "@/components/ui/Buttons";
import { BackButton } from "@/components/ui/Layout";

// Corredor azul com linhas de velocidade verde-lima (ilustracao do mockup de cadastro)
function RunnerArt() {
  return (
    <View style={styles.art} pointerEvents="none">
      <Svg width={130} height={110} viewBox="0 0 130 110" style={StyleSheet.absoluteFill}>
        <Circle cx={78} cy={44} r={40} fill={Colors.limeSoft} />
        <Path d="M30 46 H52" stroke={Colors.primary} strokeWidth={8} strokeLinecap="round" />
        <Path d="M6 62 H40" stroke={Colors.primary} strokeWidth={8} strokeLinecap="round" />
        <Path d="M22 78 H48" stroke={Colors.primary} strokeWidth={8} strokeLinecap="round" />
      </Svg>
      <View style={styles.runner}>
        <Icon name="run" size={84} color={Colors.secondary} strokeWidth={2.6} />
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const { signInWithGoogle, isGoogleLoading } = useGoogleSignIn();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas nao conferem");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/level-select");
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("409")) {
        Alert.alert("Erro", "Este email ja esta cadastrado");
      } else {
        Alert.alert("Erro", "Falha ao criar conta. Verifique sua conexao.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <BackButton onPress={goToLogin} />

      <View style={styles.header}>
        <RunnerArt />
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Comece sua jornada de treino personalizado</Text>
      </View>

      <View style={styles.form}>
        <TextField
          icon="user"
          label="Nome"
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />
        <TextField
          icon="email"
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        <TextField
          icon="lock"
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secure
          autoComplete="new-password"
        />
        <TextField
          icon="shield-check"
          label="Confirmar senha"
          placeholder="Digite sua senha novamente"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />
      </View>

      <PrimaryButton
        label="Criar conta"
        onPress={handleRegister}
        loading={isSubmitting}
        style={styles.cta}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleButton label="Cadastro com Google" onPress={signInWithGoogle} loading={isGoogleLoading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem uma conta?</Text>
        <Pressable onPress={goToLogin} hitSlop={8} accessibilityRole="link">
          <Text style={styles.link}>Entrar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 16,
    marginBottom: 28,
    gap: 8,
  },
  art: {
    position: "absolute",
    right: -8,
    top: -40,
    width: 130,
    height: 110,
  },
  runner: {
    position: "absolute",
    right: 4,
    top: 4,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 38,
    lineHeight: 44,
    color: Colors.text,
    marginTop: 24,
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    color: Colors.textSecondary,
  },
  form: {
    gap: 14,
  },
  cta: {
    marginTop: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    paddingTop: 28,
  },
  footerText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  link: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.secondary,
  },
});
