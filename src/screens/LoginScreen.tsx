import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { RootScreenProps } from "../navigation/types";
import { useAuth } from "../store/hooks";
import { login } from "../services/authService";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { validateEmail, validatePassword, getErrorMessage } from "../utils/validators";
import { colors } from "../theme";

export function LoginScreen({ navigation, route }: RootScreenProps<"Login">) {
  const { signIn } = useAuth();

  // State quản lý giá trị nhập, lỗi và cờ loading (BT8.1)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State ẩn/hiện mật khẩu (Câu hỏi bổ sung số 5)
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    // 1) Validate 2 ô nhập
    const e = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(e);
    if (e.email || e.password) return;

    // 2) Bật loading, xóa lỗi cũ và gọi service đăng nhập
    setLoading(true);
    setSubmitError(null);
    try {
      const { user, token } = await login(email, password);
      signIn(user, token);

      // 3) Xử lý điều hướng thông minh (BT8.1 & BT8.4)
      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", { total: route.params.total ?? 0 });
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (err) {
      // 4) Bắt và hiển thị lỗi chung từ backend/mạng
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Tiêu đề & Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.title}>Đăng nhập BookStore</Text>
        </View>

        {/* Form nhập liệu */}
        <View style={styles.form}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Ô nhập mật khẩu kèm nút 👁️ ẩn/hiện */}
          <View style={styles.passwordWrapper}>
            <FormField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeBtn}
              hitSlop={8}
              accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "🙈"}</Text>
            </Pressable>
          </View>

          {/* Dòng lỗi chung */}
          {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

          {/* Nút đăng nhập */}
          <PrimaryButton title="Đăng nhập" onPress={submit} loading={loading} />

          {/* Chuyển sang màn Đăng ký */}
          <Pressable
            onPress={() =>
              navigation.navigate("Register", {
                redirectTo: route.params?.redirectTo,
                total: route.params?.total,
              })
            }
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              Chưa có tài khoản? <Text style={styles.switchTextBold}>Đăng ký</Text>
            </Text>
          </Pressable>

          {/* Gợi ý tài khoản demo */}
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>
              Tài khoản demo: demo@bookstore.vn / 123456
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 28,
    zIndex: 1,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  submitError: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  switchBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    fontSize: 14,
    color: colors.muted,
  },
  switchTextBold: {
    color: colors.primary,
    fontWeight: "bold",
  },
  demoBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    alignItems: "center",
  },
  demoText: {
    fontSize: 12,
    color: colors.muted,
  },
});