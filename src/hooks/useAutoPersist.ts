import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

export function useAutoPersist<T>(key: string, value: T, ready: boolean) {
  useEffect(() => {
    // Chỉ ghi vào AsyncStorage khi đã đọc xong dữ liệu ban đầu (ready === true)
    if (ready) {
      saveJSON(key, value);
    }
  }, [key, value, ready]);
}