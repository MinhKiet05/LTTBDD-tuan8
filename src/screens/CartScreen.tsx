import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { RootScreenProps } from "../navigation/types";
import { useAuth, useCart } from "../store/hooks";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { confirmDialog } from "../utils/dialog";
import { colors } from "../theme";

// BT8.C2: Từ điển mã giảm giá cố định
const COUPONS: Record<
  string,
  { label: string; discount: (subtotal: number) => number }
> = {
  SALE10: { label: "Giảm 10%", discount: (s) => Math.round(s * 0.1) },
  GIAM50K: { label: "Giảm 50.000đ", discount: (s) => Math.min(50000, s) },
};

export function CartScreen({ navigation }: RootScreenProps<"Tabs">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth(); // BT8.4

  // BT8.C2: State quản lý mã giảm giá
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const discount = coupon ? COUPONS[coupon].discount(totalPrice) : 0;
  const finalTotal = Math.max(0, totalPrice - discount);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon(code);
      setCouponMsg(`Đã áp dụng ${code}: ${COUPONS[code].label}`);
    } else {
      setCoupon(null);
      setCouponMsg("Mã giảm giá không hợp lệ");
    }
  };

  // BT8.7a: Hàm xác nhận trước khi xóa sản phẩm
  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);
    confirmDialog(
      "Xóa sản phẩm",
      `Xóa "${item?.title ?? "sản phẩm"}" khỏi giỏ hàng?`,
      () => remove(bookId)
    );
  };

  // BT8.4: Kiểm tra đăng nhập trước khi điều hướng sang Checkout
  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", {
        redirectTo: "Checkout",
        total: finalTotal,
      });
    }
  };

  // Trạng thái giỏ hàng trống
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="🛒"
          title="Giỏ hàng trống"
          message="Hãy chọn vài cuốn sách yêu thích nhé."
          actionLabel="Khám phá sách"
          onAction={() => navigation.navigate("Tabs", { screen: "Home" })}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.bookId)}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onChangeQty={(bookId, qty) => setQty(bookId, qty)}
            onRemove={askRemove}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Nhập mã giảm giá (BT8.C2) */}
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Mã giảm giá (SALE10)"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.couponBtn} onPress={applyCoupon}>
                <Text style={styles.couponBtnText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>

            {couponMsg ? (
              <Text
                style={[
                  styles.couponMsg,
                  { color: coupon ? colors.primary : colors.danger },
                ]}
              >
                {couponMsg}
              </Text>
            ) : null}

            {/* Bảng tính tổng tiền */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryVal}>
                  {totalPrice.toLocaleString("vi-VN")} đ
                </Text>
              </View>

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Giảm giá</Text>
                  <Text style={[styles.summaryVal, { color: colors.primary }]}>
                    -{discount.toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalVal}>
                  {finalTotal.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>

            <PrimaryButton title="Thanh toán" onPress={goCheckout} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: 16,
  },
  footerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  couponRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  couponInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  couponBtn: {
    backgroundColor: "#3B3FD8", // Đặt trực tiếp mã màu indigo chuẩn của đề bài
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 42,                  // Cùng chiều cao với ô nhập để cân đối
    justifyContent: "center",
    alignItems: "center",
  },
  couponBtnText: {
    color: "#FFFFFF",           // Màu chữ trắng nổi trên nền xanh
    fontWeight: "bold",
    fontSize: 14,
  },
  couponMsg: {
    fontSize: 13,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
});