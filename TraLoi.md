# Câu trả lời bổ sung thực hành Buổi 8

### 1. Cờ ready trong useAutoPersist
Ở lần render đầu tiên khi vừa mở app, giỏ hàng trong Redux store còn là mảng rỗng `[]` và hàm đọc bất đồng bộ từ bộ nhớ chưa hoàn thành[cite: 1]. Nếu không có cờ `ready`, hook `useAutoPersist` sẽ kích hoạt ngay lập tức và ghi đè mảng rỗng này vào `AsyncStorage`, xóa sạch giỏ hàng cũ trước khi `loadJSON` kịp đọc trả về dữ liệu[cite: 1]. Cờ `ready` chỉ chuyển sang `true` sau khi quá trình đọc hoàn tất, đảm bảo app không ghi đè dữ liệu cũ ở những lần render đầu tiên[cite: 1].

---

### 2. Token giả & Bảo mật phiên làm việc
* **Hai điểm không an toàn:** Mật khẩu lưu dưới dạng bản rõ (plaintext) trong `db.json` và được đối chiếu trực tiếp trên máy người dùng; đồng thời token tự tạo ở client không có chữ ký bảo mật nên rất dễ bị giải mã hoặc làm giả[cite: 1].
* **Hệ thống thật:** Máy chủ (backend) phải là bên kiểm tra mật khẩu đã được băm (hash kèm salt) và sinh ra token chuẩn có thời hạn (như JWT)[cite: 1]. Token bảo mật nên được lưu trong kho khóa phần cứng an toàn của hệ điều hành như **Keychain (iOS)** / **Keystore (Android)** thông qua thư viện `expo-secure-store`, thay vì lưu thô dạng chuỗi trong `AsyncStorage`[cite: 1].

---

### 3. Hai effect trong CartItemRow
Nếu xóa effect đồng bộ `setQty(item.quantity)`, số lượng hiển thị trên nút sẽ bị lệch khi dữ liệu trong store thay đổi từ một nguồn khác ngoài chính component đó[cite: 1]. Cụ thể:
1. Khi app đọc giỏ hàng từ `AsyncStorage` sau khi khởi động (quá trình hydrate giỏ hàng)[cite: 1].
2. Khi người dùng xóa sản phẩm khỏi giỏ hàng rồi thêm lại cùng sản phẩm đó từ màn hình Chi tiết sách[cite: 1]. Lúc này, state cục bộ `qty` vẫn giữ nguyên giá trị của lần render trước thay vì cập nhật theo giá trị mới từ store[cite: 1].

---

### 4. Một nguồn state (Single Source of Truth)
Nếu `HeartButton` dùng `useState` riêng ở mỗi nơi, trạng thái yêu thích giữa lưới sách và trang chi tiết sẽ hoàn toàn độc lập và không đồng bộ: bấm thả tim ở lưới nhưng mở trang chi tiết thì tim vẫn ở trạng thái trắng (hoặc ngược lại)[cite: 1]. Sử dụng Redux Store giải quyết triệt để vấn đề này vì store đóng vai trò là "nguồn chân lý duy nhất" (single source of truth)[cite: 1]; mọi component đều cùng lắng nghe và đọc chung một danh sách ID từ store, đảm bảo icon tim ở mọi vị trí luôn khớp nhau[cite: 1].

---

### 5. Code bổ sung: Hiện / Ẩn mật khẩu

**Đoạn code trong `src/screens/LoginScreen.tsx`:**

```tsx
// 1. Thêm state quản lý ẩn/hiện mật khẩu
const [showPassword, setShowPassword] = useState(false);

// 2. Tùy biến ô nhập Mật khẩu kèm icon con mắt
<View style="{styles.passwordWrapper}">
  <FormField error="{errors.password}" label="Mật khẩu" onChangeText="{setPassword}" secureTextEntry="{!showPassword}" value="{password}"/>
  <Pressable onPress="{()" style="{styles.eyeBtn}"> setShowPassword((prev) => !prev)}
    hitSlop={8}
    accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
  >
    <Text style="{styles.eyeIcon}">{showPassword ? "👁️" : "🙈"}</Text>
  </Pressable>
</View>