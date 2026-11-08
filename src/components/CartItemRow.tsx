import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CartItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { colors } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, qty: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  // 1) Quản lý số lượng cục bộ và debounce 300ms
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  // 2) Đồng bộ lên store sau khi dừng bấm 300ms
  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty]);

  // 3) Đồng bộ lại state cục bộ nếu store thay đổi từ nơi khác
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // 4) Điều kiện chặn tăng / giảm
  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.container}>
      {/* Icon bìa sách */}
      <View style={[styles.coverBox, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>
          {item.price.toLocaleString("vi-VN")} đ
        </Text>

        {/* Cụm nút - số lượng + và số lượng còn lại */}
        <View style={styles.qtyRow}>
          <View style={styles.stepper}>
            <Pressable
              disabled={!canDec}
              onPress={() => setQty((q) => q - 1)}
              accessibilityLabel="Giảm"
              style={[styles.btn, !canDec && styles.btnDisabled]}
              hitSlop={6}
            >
              <Text style={[styles.btnText, !canDec && styles.textDisabled]}>−</Text>
            </Pressable>

            <Text style={styles.qtyText}>{qty}</Text>

            <Pressable
              disabled={!canInc}
              onPress={() => setQty((q) => q + 1)}
              accessibilityLabel="Tăng"
              style={[styles.btn, !canInc && styles.btnDisabled]}
              hitSlop={6}
            >
              <Text style={[styles.btnText, !canInc && styles.textDisabled]}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.stockText}>Còn {item.stock}</Text>
        </View>
      </View>

      {/* Nút xóa sản phẩm */}
      <Pressable
        onPress={() => onRemove(item.bookId)}
        accessibilityLabel="Xóa sản phẩm"
        style={styles.removeBtn}
        hitSlop={8}
      >
        <Text style={styles.removeIcon}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  coverBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 6,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnDisabled: {
    opacity: 0.3,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  textDisabled: {
    color: colors.muted,
  },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  stockText: {
    fontSize: 12,
    color: colors.muted,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  removeIcon: {
    fontSize: 18,
  },
});