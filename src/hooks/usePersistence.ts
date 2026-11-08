import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";
import { loadAuth, saveAuth, clearAuth } from "../storage/authStorage";
import { loadJSON } from "../storage/storage";
import { useAutoPersist } from "./useAutoPersist";
import { CartItem } from "../types";

const CART_KEY = "@bookstore/cart";
const WISHLIST_KEY = "@bookstore/wishlist";

export function usePersistence(): boolean {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  const [ready, setReady] = useState(false);

  // 1) Khôi phục dữ liệu khi vừa mở app
  useEffect(() => {
    (async () => {
      try {
        // Đọc cả ba dữ liệu cùng lúc
        const [auth, cart, wish] = await Promise.all([
          loadAuth(),
          loadJSON<CartItem[]>(CART_KEY),
          loadJSON<number[]>(WISHLIST_KEY),
        ]);

        if (auth?.token && auth.user) dispatch(setCredentials(auth)); // BT8.3
        if (cart) dispatch(hydrateCart(cart));                         // BT8.7b
        if (wish) dispatch(hydrateWishlist(wish));                     // BT8.7b
      } catch (err) {
        console.warn("Lỗi nạp dữ liệu lưu trữ:", err);
      } finally {
        setReady(true);
      }
    })();
  }, [dispatch]);

  // 2) Tự động lưu/xóa phiên đăng nhập (BT8.3)
  useEffect(() => {
    if (!ready) return;
    if (user && token) {
      saveAuth({ user, token });
    } else {
      clearAuth();
    }
  }, [ready, user, token]);

  // 3) Tự động lưu giỏ hàng và danh sách yêu thích mỗi khi thay đổi (BT8.7b)
  useAutoPersist(CART_KEY, cartItems, ready);
  useAutoPersist(WISHLIST_KEY, wishlistIds, ready);

  return ready;
}