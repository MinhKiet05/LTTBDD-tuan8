import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

// HOOK CHUNG: mỗi khi `value` đổi (và đã nạp xong dữ liệu cũ) → tự ghi vào AsyncStorage.
// Dùng cho cart, wishlist… — không phải viết lại effect ở từng nơi.
export function useAutoPersist<T>(key: string, value: T, ready: boolean) {
  // TODO BT8.7b: viết useEffect — nếu ready thì saveJSON(key, value); phụ thuộc [key, value, ready]
  //   Vì sao cần cờ ready? (xem câu hỏi bổ sung trong tài liệu)
}
