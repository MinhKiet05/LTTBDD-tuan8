import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { RootScreenProps } from "../navigation/types";
import { getBookById, getBooks } from "../services/bookService";
import { getReviews, addReview } from "../services/reviewService";
import { Book, Review } from "../types";
import { useAuth, useCart } from "../store/hooks";
import { RatingStars } from "../components/RatingStars";
import { BookCard } from "../components/BookCard";
import { HeartButton } from "../components/HeartButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getErrorMessage } from "../utils/validators";
import { colors } from "../theme";

export function BookDetailScreen({
  navigation,
  route,
}: RootScreenProps<"BookDetail">) {
  const { bookId } = route.params;
  const { user, isLoggedIn } = useAuth();
  const { add } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Book[]>([]); // BT8.C1
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho form đánh giá (BT8.5c)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, revs] = await Promise.all([
        getBookById(bookId),
        getReviews(bookId),
      ]);
      setBook(b);
      setReviews(revs);

      // BT8.C1: Lấy danh sách sách liên quan cùng thể loại và loại trừ sách hiện tại
      const sameCategory = await getBooks({ categoryId: b.categoryId });
      setRelated(sameCategory.filter((x) => x.id !== b.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  // BT8.5b: Tính điểm trung bình từ danh sách reviews
  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0,
    [reviews]
  );

  // BT8.5c: Gửi đánh giá mới
  const submitReview = async () => {
    if (!user) return;
    if (rating === 0) return setFormError("Vui lòng chọn số sao");
    if (!comment.trim()) return setFormError("Vui lòng nhập bình luận");

    setFormError(null);
    setSending(true);
    try {
      const created = await addReview({
        bookId,
        userId: user.id,
        userName: user.name,
        rating,
        comment: comment.trim(),
      });
      // Đưa đánh giá mới lên đầu mảng
      setReviews((prev) => [created, ...prev]);
      setRating(0);
      setComment("");
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingView label="Đang tải chi tiết sách…" />;
  if (error || !book)
    return <ErrorView message={error ?? "Không tìm thấy sách"} onRetry={load} />;

  return (
    <ScrollView style={styles.container}>
      {/* Khung ảnh bìa sách */}
      <View style={[styles.coverContainer, { backgroundColor: book.color }]}>
        <Text style={styles.coverEmoji}>{book.emoji}</Text>
        <HeartButton bookId={book.id} style={styles.heartBtn} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        {/* Điểm đánh giá trung bình & sao (BT8.5b) */}
        <View style={styles.ratingRow}>
          <RatingStars value={average} size={20} />
          <Text style={styles.ratingText}>
            {average.toFixed(1)} ({reviews.length} đánh giá)
          </Text>
        </View>

        <Text style={styles.price}>{book.price.toLocaleString("vi-VN")} đ</Text>
        <Text style={styles.stock}>Còn {book.stock} cuốn</Text>

        <Text style={styles.description}>{book.description}</Text>

        <View style={styles.btnWrapper}>
          <PrimaryButton
            title="Thêm vào giỏ"
            onPress={() => add(book)}
          />
        </View>
      </View>

      {/* Mục Đánh giá của độc giả */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionHeading}>Đánh giá của độc giả</Text>

        {isLoggedIn ? (
          // Form gửi đánh giá khi đã đăng nhập (BT8.5c)
          <View style={styles.reviewForm}>
            <Text style={styles.formLabel}>Viết đánh giá của bạn</Text>
            <View style={styles.starsSelect}>
              <RatingStars value={rating} size={28} onChange={setRating} />
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Cảm nhận của bạn về cuốn sách..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
            {formError ? (
              <Text style={styles.formErrorText}>{formError}</Text>
            ) : null}
            <PrimaryButton
              title="Gửi đánh giá"
              onPress={submitReview}
              loading={sending}
            />
          </View>
        ) : (
          // Nhắc nhở đăng nhập khi chưa đăng nhập
          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Đăng nhập để viết đánh giá.</Text>
            <Pressable
              style={styles.outlineBtn}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.outlineBtnText}>Đăng nhập</Text>
            </Pressable>
          </View>
        )}

        {/* Danh sách các bài đánh giá */}
        <View style={styles.reviewList}>
          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{rev.userName}</Text>
                <RatingStars value={rev.rating} size={14} />
              </View>
              <Text style={styles.reviewComment}>{rev.comment}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* BT8.C1: Hàng ngang Sách liên quan */}
      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionHeading}>Sách liên quan</Text>
          <FlatList
            horizontal
            data={related}
            keyExtractor={(b) => String(b.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
            renderItem={({ item }) => (
              <View style={styles.relatedCardWrapper}>
                <BookCard
                  book={item}
                  onPress={(b) =>
                    navigation.push("BookDetail", { bookId: b.id })
                  }
                />
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  coverContainer: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coverEmoji: {
    fontSize: 90,
  },
  heartBtn: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  infoContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  author: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: colors.muted,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  stock: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 20,
  },
  btnWrapper: {
    marginTop: 4,
  },
  reviewsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  reviewForm: {
    backgroundColor: colors.bg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  starsSelect: {
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    fontSize: 14,
    marginBottom: 8,
  },
  formErrorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 10,
  },
  loginPrompt: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    marginBottom: 20,
  },
  promptText: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  outlineBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  reviewList: {
    gap: 14,
  },
  reviewItem: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  relatedSection: {
    paddingVertical: 20,
    marginBottom: 24,
  },
  relatedList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  relatedCardWrapper: {
    width: 150,
  },
});