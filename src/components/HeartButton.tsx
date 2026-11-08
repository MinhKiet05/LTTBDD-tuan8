import React from "react";
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useWishlist } from "../store/hooks";
import { colors } from "../theme";

interface Props {
  bookId: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function HeartButton({ bookId, size = 34, style }: Props) {
  // 1) Đọc trạng thái yêu thích và hàm toggle từ Redux store
  const { isFavorite, toggle } = useWishlist();
  const fav = isFavorite(bookId);

  return (
    <Pressable
      onPress={() => toggle(bookId)}
      accessibilityLabel={fav ? "Bỏ yêu thích" : "Yêu thích"}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      hitSlop={6}
    >
      <Text
        style={[
          styles.heartIcon,
          { fontSize: size * 0.52, color: fav ? colors.heart : colors.muted },
        ]}
      >
        {fav ? "♥" : "♡"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIcon: {
    fontWeight: "bold",
  },
});