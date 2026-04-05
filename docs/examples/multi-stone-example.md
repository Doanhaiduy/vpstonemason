# 🪨 MULTI-STONE CONTENT SCRIPT (Demo 5 Mẫu)

> **Loại bài đăng:** Multi-Stone Collection
> **Mục tiêu:** Đăng 5 mẫu đá khác nhau trong 1 bài Facebook (Carousel 10 ảnh)
> **Chiến lược:** Mỗi mẫu đá sẽ được gen 1 cảnh KHÁC NHAU hoàn toàn + 1 ảnh close-up, đảm bảo bài post phong phú, không bị nhàm chán.

---

## 🔄 CHIẾN LƯỢC MỖI MẪU 1 CẢNH (Không trùng lặp)

Để không bị trùng lặp khi người dùng lướt facebook xem (carousel), Agent sẽ phân bổ 5 cảnh khác nhau cho 5 mẫu:

| # | Mẫu Đá | Aspect Ratio | Phân công cảnh | Mục đích |
|---|--------|-------------|----------------|----------|
| **1** | **VP1017 (Amazonite)** | 1:1 | `kitchen-island` | Đảo bếp lớn, làm ảnh Hero bài viết |
| **1b**| VP1017 (Amazonite) | 1:1 | `close-up-detail`| Kèm ảnh vân chi tiết |
| **2** | **VP1019 (Arabescato)** | 1:1 | `bathroom-vanity`| Lavabo phòng tắm cao cấp |
| **2b**| VP1019 (Arabescato) | 1:1 | `close-up-detail`| Kèm ảnh vân chi tiết |
| **3** | **VP6011 (Calacatta)** | 1:1 | `kitchen-l-shape`| Bếp chữ L, tủ bếp gỗ |
| **3b**| VP6011 (Calacatta) | 1:1 | `close-up-detail`| Kèm ảnh vân chi tiết |
| **4** | **VP8020 (Nero Marquina)**| 1:1 | `fireplace` | Lối sưởi phòng khách sang trọng |
| **4b**| VP8020 (Nero Marquina)| 1:1 | `close-up-detail`| Kèm ảnh vân chi tiết |
| **5** | **VP3044 (Pure White)** | 1:1 | `laundry` | Bàn phòng giặt hiện đại |
| **5b**| VP3044 (Pure White) | 1:1 | `close-up-detail`| Kèm ảnh vân chi tiết |

> **Lưu ý tỷ lệ ảnh:** Với bài có từ 5-10 ảnh (Multi mode), Agent mặc định chọn **Square 1:1 (1080x1080)** cho tất cả các ảnh. Khung vuông giúp Facebook hiển thị Carousel (dạng trượt) đều, đẹp và chuyên nghiệp nhất, tránh bị cắt xén ảnh.

---

## 🖼️ TÓM TẮT HƯỚNG DẪN GEN ẢNH TRÊN GOOGLE FLOW

*Bạn lặp lại các bước này trên Flow, upload đúng ảnh slab tham chiếu tương ứng:*

**Mẫu 1: Amazonite VP1017**
- Kịch bản 1: `A modern Australian kitchen with a large island benchtop... [1:1 ratio]`
- Kịch bản 2: `Close-up pencil round edge detail of Amazonite stone... [1:1 ratio]`
- Caption riêng (ảnh 1): *"The striking Amazonite VP1017 taking center stage in this modern kitchen island."*

**Mẫu 2: Arabescato VP1019**
- Kịch bản 1: `A high-end bathroom double vanity with frameless mirror... [1:1 ratio]`
- Kịch bản 2: `Close-up pencil round edge detail of Arabescato stone... [1:1 ratio]`
- Caption riêng (ảnh 1): *"Classic elegance meets modern luxury with Arabescato VP1019 in the bathroom."*

*(...Tương tự cho Mẫu 3, 4, 5...)*

---

## 🎬 VIDEO TỔNG HỢP (Meta AI)

Thay vì từng video ngắn, Agent sẽ tạo prompt gen 1 video panning khoe trọn bộ siêu tập (mô phỏng không gian showroom).

**Prompt video:**
```text
A smooth 8-second cinematic camera pan slowly moving across a high-end stone gallery. Displaying multiple premium polished stone slabs side-by-side in natural lighting. From seafoam green Amazonite to dark Nero Marquina and classic Calacatta. Elegant showroom environment, warm lighting, stable camera, photorealistic.
```
**Video Caption:** *"Discover our latest ArtsCut Zero premium range. 100% Crystalline Silica Free. 🎥"*

---

## 📝 CAPTION BÀI ĐĂNG GỘP (TIẾNG ANH)

```text
✨ New Collection Showdown: Which is your favourite? ✨

We've just updated our showroom with 5 incredible new CSF-compliant premium stones from ArtsCut Zero. From the vibrant coastal hues of Amazonite to the deep luxury of Nero Marquina, there's a perfect stone for every Australian home.

Swipe to see how they look across kitchens, bathrooms, and living spaces! 👉

🔹 VP1017 Amazonite: Seafoam green with golden flecks — the ultimate statement island
🔹 VP1019 Arabescato: Classic Italian marble look — perfect for luxury bathroom vanities
🔹 VP6011 Calacatta: Bold grey veining — timeless in any L-shaped kitchen
🔹 VP8020 Nero Marquina: Deep black with striking white veins — a stunning fireplace surround
🔹 VP3044 Pure White: Clean and minimal — the bright choice for modern laundries

All 100% Crystalline Silica Free ✅ | Scratch & heat resistant 💎

Which one would you choose? Let us know below! 👇

📩 DM us or call 0424 439 293 for a FREE quote today!

#VPStoneMason #StoneBenchtops #Melbourne #KitchenDesign #BathroomDesign #EngineeredStone #AustralianHomes #HomeRenovation #MelbourneHomes #PremiumStone #CSFStone #InteriorDesign #ArtsCutZero #KitchenIsland #BathroomVanity

— — — — —
🏢 PVstoneau - Premium Stone Benchtops Melbourne
📍 Showroom: 32 Spalding Ave Sunshine North VIC
📞 Phone: 0424 439 293
✉️ Email: info@vpstonemason.com.au
🌐 Website: https://vpstonemason.vercel.app/
```
