import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number; // 0–5 (có thể lẻ, làm tròn khi vẽ)
  size?: number;
  onChange?: (v: number) => void; // có truyền → cho phép bấm chọn sao
}

// TODO BT8.5a: component sao TÁI SỬ DỤNG
//   - vẽ 5 ngôi sao ★: sao <= Math.round(value) màu colors.warning, còn lại colors.line; cỡ chữ = size
//   - nếu có onChange: bọc mỗi sao trong Pressable, bấm sao n → onChange(n)
export function RatingStars({ value, size = 18 }: Props) {
  return (
    <View style={styles.todo}>
      <Text style={[styles.todoText, { fontSize: Math.max(10, size * 0.6) }]}>TODO BT8.5a · RatingStars (value = {value.toFixed(1)})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  todo: { borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.warning, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#FFFBEB" },
  todoText: { color: "#B45309", fontWeight: "700" },
});
