import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

// O idToken e emitido para o cliente Web; o cliente Android (pacote + SHA-1) so autoriza o app
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { loginWithCredentials, loginWithGoogle } = useApp();

  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Indisponivel", "Login com Google disponivel apenas no app Android.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type !== "success") return;

      const idToken = result.data.idToken;
      if (!idToken) {
        throw new Error("Google nao retornou idToken");
      }

      const userData = await loginWithGoogle(idToken);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!userData.level) {
        router.replace("/level-select");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      console.error("Google auth error:", e);
      const message = String(e?.message || "");
      Alert.alert(
        "Erro",
        message.startsWith("409")
          ? "Este email ja esta cadastrado com senha. Entre com email e senha."
          : "Falha ao entrar com Google. Tente novamente.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

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

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 20,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[Colors.primary, Colors.primary]}
            style={styles.miniLogo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.miniDumbbell}>
              <View style={styles.miniWeight} />
              <View style={styles.miniBar} />
              <View style={styles.miniWeight} />
            </View>
          </LinearGradient>
          <Text style={styles.logoText}>Eu me treino</Text>
        </View>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>
          Entre na sua conta para continuar treinando
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={Colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        </View>

        <Pressable style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </Pressable>

        <Pressable
          onPress={handleLogin}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.buttonPressed,
            isSubmitting && styles.buttonDisabled,
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primary]}
            style={styles.loginGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.loginText}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.buttonPressed,
            isGoogleLoading && styles.buttonDisabled,
          ]}
        >
          <Ionicons name="logo-google" size={20} color={Colors.text} />
          <Text style={styles.googleText}>
            {isGoogleLoading ? "Entrando..." : "Entrar com Google"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Nao tem uma conta?</Text>
        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.footerLink}>Criar conta</Text>
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
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    gap: 8,
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  miniLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  miniDumbbell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniWeight: {
    width: 6,
    height: 16,
    backgroundColor: Colors.onPrimary,
    borderRadius: 2,
  },
  miniBar: {
    width: 12,
    height: 4,
    backgroundColor: Colors.onPrimary,
    borderRadius: 2,
  },
  logoText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  title: {
    fontSize: 30,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.primary,
  },
  loginButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 17,
    color: Colors.onPrimary,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  googleText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 16,
    color: Colors.text,
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
  footerLink: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
  },
});
