import { Book } from "../types";
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
import React, { useState, useEffect, useCallback, useMemo } from "react";

export function WishlistScreen({ navigation }: RootScreenProps<"Wishlist">) {
  // 1) Lấy danh sách ID đã lưu từ Redux store
  const { ids } = useWishlist();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API lấy toàn bộ sách
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 2) Lọc những cuốn sách có ID nằm trong danh sách yêu thích
  const favorites = useMemo(
    () => books.filter((b) => ids.includes(b.id)),
    [books, ids]
  );

  // 3) Xử lý các trạng thái: Đang tải hoặc Báo lỗi
  if (loading) return <LoadingView label="Đang tải sách yêu thích…" />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  // 4) Hiển thị lưới sách yêu thích và trạng thái rỗng
  return (
    <View style={styles.container}>
      <BookGrid
        data={favorites}
        onPressBook={(b) => navigation.navigate("BookDetail", { bookId: b.id })}
        ListEmptyComponent={
          <EmptyState
            emoji="💔"
            title="Chưa có sách yêu thích"
            message="Nhấn ♡ trên mỗi cuốn sách để lưu lại ở đây."
            actionLabel="Khám phá sách"
            onAction={() => navigation.navigate("Tabs", { screen: "Home" })}
          />
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
});