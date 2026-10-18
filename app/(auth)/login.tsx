import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useApp } from "@/contexts/AppContext";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import TextField from "@/components/ui/TextField";
import { GoogleButton, PrimaryButton } from "@/components/ui/Buttons";
import { BrandMark } from "@/components/ui/Layout";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const { loginWithCredentials } = useApp();
  const { signInWithGoogle, isGoogleLoading } = useGoogleSignIn();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSubmitting(true);
    try {
      const userData = await loginWithCredentials(email.trim(), password);
      if (!userData.level) {
        router.replace("/level-select");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("401")) {
        Alert.alert("Erro", "Email ou senha incorretos");
      } else if (msg.includes("404")) {
        Alert.alert("Erro", "Conta nao encontrada");
      } else {
        Alert.alert("Erro", "Falha ao entrar. Verifique sua conexao.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ainda nao ha envio de e-mail para redefinir senha
  const handleForgotPassword = () => {
    Alert.alert(
      "Esqueci minha senha",
      "A redefinição de senha por e-mail ainda não está disponível. Se sua conta usa um Gmail, você pode entrar com Google.",
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
        bottomOffset={24}
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 32,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <BrandMark />

      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre na sua conta para continuar treinando</Text>
      </View>

      <View style={styles.form}>
        <TextField
          icon="email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          testID="login-email"
        />
        <TextField
          icon="lock"
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secure
          autoComplete="password"
          testID="login-password"
        />
        <Pressable
          onPress={handleForgotPassword}
          style={styles.forgot}
          hitSlop={8}
          accessibilityRole="link"
        >
          <Text style={styles.link}>Esqueci minha senha</Text>
        </Pressable>
      </View>

      <PrimaryButton
        label="Entrar"
        onPress={handleLogin}
        loading={isSubmitting}
        style={styles.cta}
        testID="login-submit"
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleButton label="Entrar com Google" onPress={signInWithGoogle} loading={isGoogleLoading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Não tem uma conta?</Text>
        <Pressable onPress={() => router.push("/(auth)/register")} hitSlop={8} accessibilityRole="link">
          <Text style={styles.link}>Criar conta</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
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
    marginTop: 48,
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 36,
    lineHeight: 42,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    color: Colors.textSecondary,
  },
  form: {
    gap: 14,
  },
  forgot: {
    alignSelf: "flex-end",
    minHeight: 32,
    justifyContent: "center",
  },
  link: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.secondary,
  },
  cta: {
    marginTop: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 24,
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
    paddingTop: 32,
  },
  footerText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
