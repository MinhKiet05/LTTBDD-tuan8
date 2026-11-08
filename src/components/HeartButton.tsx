import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "../theme";

interface Props {
  bookId: number;
  size?: number;
  style?: ViewStyle;
}

// TODO BT8.8a: nút tim đọc/ghi CHUNG store wishlist (hook useWishlist() → { isFavorite, toggle })
//   - fav = isFavorite(bookId); hiện ♥ (đỏ colors.heart) nếu fav, ♡ (colors.muted) nếu chưa
//   - onPress → toggle(bookId); accessibilityLabel "Yêu thích" / "Bỏ yêu thích"
// Hiện tại tim chỉ là hình — bấm không có tác dụng.
export function HeartButton({ size = 34, style }: Props) {
  return (
    <Pressable style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Text style={{ fontSize: size * 0.55, color: colors.muted }}>♡</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center", zIndex: 2 },
});
