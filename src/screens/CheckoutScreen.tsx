import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RootScreenProps } from "../navigation/types";
import { useAuth } from "../store/hooks";
import { colors } from "../theme";

export function CheckoutScreen({ navigation, route }: RootScreenProps<"Checkout">) {
  // BT8.4: Kiểm tra trạng thái đăng nhập
  const { isLoggedIn } = useAuth();
  const total = route.params?.total ?? 0;

  useEffect(() => {
    // Nếu lọt vào màn Checkout mà chưa đăng nhập thì đẩy về Login
    if (!isLoggedIn) {
      navigation.replace("Login", {
        redirectTo: "Checkout",
        total: route.params.total,
      });
    }
  }, [isLoggedIn, navigation, route.params.total]);

  // Nếu chưa đăng nhập, không render nội dung để tránh nhấp nháy giao diện
  if (!isLoggedIn) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Tổng tiền cần thanh toán</Text>
        <Text style={styles.total}>{total.toLocaleString("vi-VN")} đ</Text>
        <Text style={styles.subtext}>
          (Form địa chỉ & thanh toán sẽ làm ở buổi sau)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 8,
  },
  total: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
});