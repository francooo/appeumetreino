import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { IconName } from "@/components/Icon";
import TextField from "./TextField";
import { PrimaryButton } from "./Buttons";

interface NumberPromptProps {
  visible: boolean;
  title: string;
  label: string;
  icon: IconName;
  initialValue?: string;
  suffix?: string;
  allowDecimal?: boolean;
  min: number;
  max: number;
  onCancel: () => void;
  onSubmit: (value: number) => Promise<void> | void;
}

// Modal com um campo numerico (meta de calorias, peso). Aceita virgula como decimal.
export default function NumberPrompt({
  visible,
  title,
  label,
  icon,
  initialValue = "",
  suffix,
  allowDecimal,
  min,
  max,
  onCancel,
  onSubmit,
}: NumberPromptProps) {
  const [text, setText] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setText(initialValue);
      setError(null);
    }
  }, [visible, initialValue]);

  const handleSubmit = async () => {
    const value = Number(text.replace(",", "."));
    if (!Number.isFinite(value) || value < min || value > max || (!allowDecimal && !Number.isInteger(value))) {
      setError(`Informe um valor entre ${min} e ${max}${suffix ? ` ${suffix}` : ""}.`);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(value);
    } catch {
      setError("Não foi possível salvar. Verifique sua conexão.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <TextField
            icon={icon}
            label={label}
            value={text}
            onChangeText={setText}
            keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
            autoFocus
            onSubmitEditing={handleSubmit}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Salvar" trailingIcon="check" onPress={handleSubmit} loading={saving} />
          <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,19,24,0.45)",
  },
  sheet: {
    gap: 14,
    padding: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 24,
    color: Colors.text,
  },
  error: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.error,
  },
  cancel: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
