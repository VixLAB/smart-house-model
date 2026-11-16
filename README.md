# Smart House – Nhà IoT 3 Tầng

Web điều khiển và mô hình 3D cho mô hình nhà thông minh: các mạch ESP8266 ghi/đọc Firebase Realtime Database (project `smart-house-fcd4f`), web đọc/ghi qua API riêng.

```
Trang web (public/nha-iot.html)  →  /api/devices (Next.js)  →  Firebase /home  ←  mạch ESP8266 (firmware/)
```

## Thư mục

| Đường dẫn | Nội dung |
|---|---|
| `public/nha-iot.html` | Trang điều khiển + mô hình 3D (mô phỏng, đi vào nhà, mạch thật qua API) |
| `src/app/api/devices/` | API: `GET /api/devices`, `GET` và `POST /api/devices/{id}` |
| `src/app/api/session/` | Đăng nhập trang web: `POST` (email, mật khẩu), `GET` (đang đăng nhập là ai), `DELETE` (đăng xuất) |
| `src/lib/devices.js` | Danh mục thiết bị (10 thiết bị thật, 3 thiết bị chỉ có khi mô phỏng), đường dẫn Firebase, cách dịch lệnh |
| `src/lib/firebaseAdmin.js` | Server đọc/ghi Firebase bằng tài khoản email/mật khẩu hoặc khóa service account trong biến môi trường |
| `src/lib/apiAuth.js` | Chỉ cho người đã đăng nhập hoặc script có khóa API dùng API, CORS |
| `src/lib/session.js` | Phiên đăng nhập: cookie ký HMAC, nhớ 7 ngày |
| `.env` | Biến môi trường khi chạy trên máy, xem [Biến môi trường](#biến-môi-trường). **Bí mật, không chia sẻ, không đưa lên GitHub** |
| `firmware/` | Code Arduino cho các mạch (đã trỏ sang project mới) |

## Chạy web

Cần Node.js 18.18 trở lên.

```
npm install
npm run dev
```

Mở http://localhost:3000: trang chủ chính là trang điều khiển (file `public/nha-iot.html`, phục vụ tại `/` nhờ `next.config.mjs`; link cũ `/nha-iot.html` tự về `/`). Bấm **Mạch thật** rồi đăng nhập bằng một tài khoản trong Firebase → Authentication của project (tự đăng ký đã tắt, nên tài khoản do người quản lý tạo cho từng người). Trình duyệt nhớ đăng nhập 7 ngày; nút **Đăng xuất** ở trên cùng. Tài khoản của mạch mà server dùng để đọc/ghi Firebase vẫn chỉ nằm trong biến môi trường.

Kiểm tra nhanh API: mở http://localhost:3000/api/devices. Thấy "Cần đăng nhập để dùng mạch thật" là server đã chạy đúng.

## Biến môi trường

Đặt trong file `.env` khi chạy trên máy, hoặc trên Vercel ở Settings → Environment Variables (đổi xong phải **Redeploy**). Tài khoản Firebase chỉ nằm trên server, trang web không thấy.

| Biến | Nội dung |
|---|---|
| `FIREBASE_EMAIL` | Email tài khoản Firebase Authentication mà server dùng, vd. tài khoản của các mạch. UID của nó phải có trong Rules |
| `FIREBASE_PASSWORD` | Mật khẩu tài khoản đó |
| `SMART_HOME_API_KEY` | Không bắt buộc. Khóa cho script gọi API không qua trang (header `x-api-key`). Trang web dùng đăng nhập, không hỏi khóa này |
| `SESSION_SECRET` | Không bắt buộc. Chuỗi bí mật dài để ký cookie đăng nhập; chưa đặt thì dùng `SMART_HOME_API_KEY` hoặc `FIREBASE_PASSWORD`. Đổi giá trị thì mọi người phải đăng nhập lại |
| `FIREBASE_SERVICE_ACCOUNT` | Không bắt buộc. Có thì server dùng khóa service account (JSON trên một dòng) thay cho email/mật khẩu |
| `FIREBASE_API_KEY`, `FIREBASE_DATABASE_URL` | Không bắt buộc. Mặc định là của project `smart-house-fcd4f` |

## Nạp firmware

1. Trong Firebase → Authentication → Utilisateurs → **Ajouter un utilisateur**: tạo tài khoản cho mạch. Nếu đây là tài khoản mới (không phải tài khoản đang có), thêm UID của nó vào Rules, xem mục [Bảo mật và hạn mức Firebase](#bảo-mật-và-hạn-mức-firebase).
2. Trong file firmware của từng mạch ESP8266 nối mạng đang lắp (bảng dưới đây), thay `DIEN_EMAIL_TAI_KHOAN_MACH` và `DIEN_MAT_KHAU_TAI_KHOAN_MACH` bằng tài khoản vừa tạo, và `DIEN_MAT_KHAU_CAI_DAT` bằng mật khẩu Wi-Fi cài đặt do bạn tự đặt (từ 8 ký tự, **giống nhau ở mọi mạch**). Mật khẩu Wi-Fi nhà không nằm trong code, xem bước 5. **Không commit file đã điền mật khẩu lên GitHub.**
3. Arduino IDE → Library Manager cài: **Firebase Arduino Client Library for ESP8266 and ESP32** (Mobizt), **LiquidCrystal I2C**, **Keypad**, **DHT sensor library**, **Adafruit Unified Sensor**, **Adafruit Fingerprint Sensor Library**, **Adafruit SSD1306**, **Adafruit GFX**. **Keypad_I2C** không có trong Library Manager: tải [joeyoung/arduino_keypads](https://github.com/joeyoung/arduino_keypads), chép thư mục `Keypad_I2C` vào `Documents/Arduino/libraries`.
4. Chép thư mục `firmware/libraries/WiFiShare` vào `Documents/Arduino/libraries`. Board: NodeMCU 1.0 (ESP-12E), giữ Flash Size mặc định (có 2 MB FS để lưu mạng).
5. **Vào Wi-Fi nhà lần đầu:** nạp xong tất cả các mạch rồi bật chúng cùng lúc. Chưa có mạng nên khoảng 1 phút sau, một mạch phát Wi-Fi `SmartHouse-CaiDat`. Vào Wi-Fi đó bằng điện thoại (mật khẩu ở bước 2), trang cài đặt tự mở (hoặc mở `http://192.168.4.1`). Chọn Wi-Fi nhà, nhập mật khẩu, bấm **Lưu và chuyển mạng**. Mỗi mạch tự vào Wi-Fi nhà và báo lại trên trang; xong thì Wi-Fi cài đặt tắt. Mạng được lưu trong mạch, nạp lại firmware vẫn còn.

Sau này đổi router hoặc mật khẩu Wi-Fi thì các mạch không vào được mạng, Wi-Fi cài đặt tự hiện lại: làm như bước 5. Mạch nào đang tắt lúc đó, bật lên sau sẽ tự phát Wi-Fi cài đặt riêng; nhập mạng thêm một lần cho nó. Chi tiết: `firmware/libraries/WiFiShare/README.md`.

| Firmware | Mạch | Thiết bị |
|---|---|---|
| `cua_chinh` | ESP8266 | Tầng 1: cửa chính (bàn phím 4x4, LCD, động cơ cửa), quạt tầng 1 (relay `light_room_1`) |
| `bao_trom_va_do_am` | ESP8266 | Tầng 1, ở nhà xe: báo trộm hồng ngoại, còi, DHT11, LCD 16x2 |
| `baochay_denl2` | ESP8266 | Tầng 2: cảm biến khói MQ-2, còi, đèn LED, nút nhấn |
| `van_tay` | ESP8266 | Tầng 3: khóa cửa vân tay |
| `thang_may` | Arduino Uno | Thang máy 3 tầng: động cơ L298N, nút gọi, công tắc hành trình (không nối mạng) |
| `led_oled` | ESP8266 | Màn hình chào OLED (không nối mạng) |
| `nha_xe_moi_nhat` | ESP8266 | Cửa cuốn nhà xe, bản cũ trên mạch riêng. Nay nằm trong `floor_1_Duy` |
| `den_wc` | ESP8266 | 2 đèn WC tự bật bằng PIR. **Nhà thật không lắp**, trên web chỉ có khi mô phỏng |
| `floor_1_Duy` | ESP8266 | Bản gộp tầng 1 trên một mạch, thay cho `cua_chinh` + `nha_xe_moi_nhat` + phần DHT11 của `bao_trom_va_do_am`: cửa chính (bàn phím, LCD, servo, còi), cửa garage và quạt (một L298N), 2 dây LED (`led_strip_1`, `led_strip_2`), DHT11 + LCD thứ hai. Sơ đồ chân ở đầu file. Không chạy chung với các mạch nó thay thế |

Đèn tầng 3 (`light_room_3` trong `van_tay`) cũng chỉ có khi mô phỏng. Thiết bị chỉ có khi mô phỏng được đánh dấu `sim: true` trong `src/lib/devices.js`: API, app điện thoại và trang web ở chế độ mạch thật bỏ qua chúng. Lắp thêm thiết bị nào thì bỏ `sim: true` của nó (ở cả `src/lib/devices.js` và bản sao trong `public/nha-iot.html`).

## Bảo mật và hạn mức Firebase

- **Rules** chỉ cho đúng tài khoản của mạch (và app) đọc/ghi nhánh `/home`. Server web dùng `FIREBASE_EMAIL` cũng phải có UID trong Rules; dùng luôn tài khoản của mạch là đơn giản nhất. Thêm tài khoản khác thì vào Realtime Database → Rules, thêm `|| auth.uid === '<UID>'` vào cả `.read` và `.write`. Nếu dùng `FIREBASE_SERVICE_ACCOUNT` thì không bị Rules chặn.
- **Tự đăng ký tài khoản đã tắt** (Authentication → Settings → User actions). API key nằm công khai trong code, nên nếu bật lại thì ai cũng tạo được tài khoản.
- **Hạn mức gói Spark miễn phí: tải xuống 10 GB/tháng**, tính cả header HTTP và mã hóa. Vì vậy firmware nhận lệnh qua **stream** (giữ một kết nối, chỉ nhận dữ liệu khi giá trị đổi) và chỉ ghi khi giá trị đổi, không đọc/ghi Firebase ở mỗi vòng `loop()`. Khi sửa firmware, giữ nguyên cách này. Theo dõi mức dùng ở Realtime Database → Usage.
- Trang web ở chế độ API hỏi `/api/devices` mỗi 1,5 giây và tự ngừng khi tab bị ẩn.

## Đưa lên mạng (tùy chọn)

Đẩy thư mục lên GitHub (file `.env` đã nằm trong `.gitignore`), tạo project trên Vercel, rồi vào Settings → Environment Variables thêm các biến ở mục [Biến môi trường](#biến-môi-trường) và Redeploy. Nối project Vercel với repo GitHub (Settings → Git) thì mỗi lần push, Vercel tự triển khai bản mới.
