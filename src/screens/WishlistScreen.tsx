import React from "react";
import { StyleSheet, View } from "react-native";
import { TodoBox } from "../components/TodoBox";
import { BookGrid } from "../components/BookGrid"; // lưới 2 cột dùng lại
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

// TODO BT8.8b: màn Danh sách yêu thích
//   1) const { ids } = useWishlist(); state books / loading / error; useEffect gọi getBooks() (xử lý loading + lỗi + Thử lại như HomeScreen)
//   2) favorites = books.filter((b) => ids.includes(b.id))  (useMemo)
//   3) <BookGrid data={favorites} onPressBook=... /> — bỏ tim tại đây thì sách biến mất ngay
//   4) ListEmptyComponent = <EmptyState emoji="💔" title="Chưa có sách yêu thích" ... actionLabel="Khám phá sách" /> → về Home
export function WishlistScreen(_props: RootScreenProps<"Wishlist">) {
  return (
    <View style={styles.container}>
      <TodoBox id="BT8.8b">{"Danh sách yêu thích: lấy sách từ API, lọc theo ids trong store wishlist, hiển thị bằng BookGrid; rỗng → EmptyState “Chưa có sách yêu thích”."}</TodoBox>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg, padding: 16 } });
