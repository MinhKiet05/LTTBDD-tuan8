import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { TodoBox } from "../components/TodoBox";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { register } from "../services/authService"; // đã viết sẵn: register(name, email, password)
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import { validateEmail, validatePassword, validateRequired } from "../utils/validators";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function RegisterScreen({ navigation, route }: RootScreenProps<"Register">) {
  const { signIn } = useAuth();

  // Khai báo các state cho 4 ô nhập, lỗi, lỗi submit và loading
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // 1) Validate cả 4 ô: confirm phải trùng khớp với password
    const e = {
      name: validateRequired("họ tên")(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: confirm === password ? null : "Mật khẩu nhập lại không khớp",
    };

    setErrors(e);
    // Nếu có bất kỳ ô nào có lỗi thì dừng lại
    if (Object.values(e).some(Boolean)) return;

    // 2) Bật loading, xóa lỗi submit cũ và gọi API đăng ký
    setLoading(true);
    setSubmitError(null);
    try {
      const { user, token } = await register(name, email, password);
      // Đăng ký xong tự đăng nhập luôn vào hệ thống
      signIn(user, token);

      // 3) Xử lý điều hướng tương tự như Login
      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", { total: route.params.total ?? 0 });
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tạo tài khoản mới</Text>

        <FormField
          label="Họ tên"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
        />

        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <FormField
          label="Nhập lại mật khẩu"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
        />

        {/* Dòng lỗi chung (nếu email đã tồn tại hoặc lỗi mạng) */}
        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton
          title="Đăng ký"
          onPress={submit}
          loading={loading}
        />
        <Pressable onPress={() => navigation.replace("Login", route.params)}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy, textAlign: "center", marginBottom: 6 },
  submitError: { color: colors.danger, textAlign: "center" },
  link: { color: colors.indigo, fontWeight: "700", textAlign: "center" },
});
