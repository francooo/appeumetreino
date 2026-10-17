import { useState } from "react";
import { Alert, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useApp } from "@/contexts/AppContext";

// O idToken e emitido para o cliente Web; o cliente Android (pacote + SHA-1) so autoriza o app
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// Entrar e cadastrar com Google sao o mesmo fluxo: o servidor cria a conta se ela nao existir
export function useGoogleSignIn() {
  const { loginWithGoogle } = useApp();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Indisponivel", "Login com Google disponivel apenas no app Android.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Sem isso o Google reutiliza a ultima conta e o seletor de contas nao aparece
      await GoogleSignin.signOut().catch(() => {});
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
      let text = "Falha ao entrar com Google. Tente novamente.";
      if (message.startsWith("409")) {
        text = "Este email ja esta vinculado a outra conta Google.";
      } else if (message.startsWith("401")) {
        text = "O servidor recusou o token do Google (cliente Web nao confere).";
      } else if (isErrorWithCode(e)) {
        // Codigo nativo (ex.: DEVELOPER_ERROR = cliente Android/SHA-1 nao cadastrado no projeto)
        text = `Falha ao entrar com Google.\n\nCodigo: ${e.code}\n${message}`;
      } else if (message) {
        text = `Falha ao entrar com Google.\n\n${message}`;
      }
      Alert.alert("Erro", text);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return { signInWithGoogle, isGoogleLoading };
}
