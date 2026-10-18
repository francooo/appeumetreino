import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  icon: IconName;
  // Rotulo pequeno acima do valor (cadastro); sem ele, o placeholder faz o papel (login)
  label?: string;
  // Campo de senha com botao de mostrar/ocultar
  secure?: boolean;
  testID?: string;
}

export default function TextField({ icon, label, secure, testID, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.box, focused && styles.boxFocused]}>
      <Icon name={icon} size={24} color={Colors.text} />
      <View style={styles.inputWrap}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          {...inputProps}
          secureTextEntry={secure ? hidden : inputProps.secureTextEntry}
          placeholderTextColor={Colors.textMuted}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={styles.input}
          accessibilityLabel={label || inputProps.placeholder}
          testID={testID}
        />
      </View>
      {secure ? (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
        >
          <Icon name={hidden ? "eye" : "eye-off"} size={24} color={Colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  boxFocused: {
    borderColor: Colors.secondary,
  },
  inputWrap: {
    flex: 1,
  },
  label: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  input: {
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    color: Colors.text,
    paddingVertical: 4,
  },
});
