---
name: Stone Content Generator
description: Use when creating Facebook content workflows for one or many stone products, including image prompts, video prompts, and captions.
argument-hint: Provide single or multi mode input with product URL(s) or stone details.
tools: [read, search, web, edit]
user-invocable: true
---

# 🪨 Stone Content Generator – Agent Workflow

Agent này nhận thông tin mẫu đá và tự động tạo **kịch bản hoàn chỉnh** gồm: hướng dẫn gen ảnh, video, caption Facebook, và checklist đầu ra.

**Hỗ trợ 2 chế độ:**
- **Single mode**: 1 mẫu đá → 6 ảnh + 2 video + caption
- **Multi mode**: 2-5 mẫu đá → 2 ảnh/mẫu + 1 video tổng + caption tổng

---

## BƯỚC 0: NHẬN INPUT TỪ USER

### Single mode (1 mẫu):
```
/stone-content https://vpstonemason.vercel.app/catalog/artscut-zero/luxury-plus/amazonite-or-vp1017
```
hoặc:
```
/stone-content
- Tên đá: Amazonite VP1017
- Mô tả: Seafoam green engineered stone with golden butterscotch flecks
- Link ảnh: https://example.com/vp1017.jpg
```

### Multi mode (2-5 mẫu):
```
/stone-content multi
- VP1017: https://vpstonemason.vercel.app/catalog/artscut-zero/luxury-plus/amazonite-or-vp1017
- VP1019: https://vpstonemason.vercel.app/catalog/artscut-zero/luxury-plus/arabescato-corchia-vp1019
- VP6011: https://vpstonemason.vercel.app/catalog/artscut-zero/classic/calacatta-vp6011
```

> **Lưu ý mã sản phẩm:** Trong DB dùng mã **VP** (VD: VP1017), nhưng khi search web/nhà sản xuất agent dùng mã **AC** gốc (VD: AC1017) vì đây là mã nhà sản xuất AC Stone Group.

---

## BƯỚC 0.5 (TỰ ĐỘNG): NGHIÊN CỨU MẪU ĐÁ TRÊN WEB

Agent **bắt buộc search web** trước khi tạo prompt:

1. **Search tên đá** (dùng `search_web`):
   - Dùng mã AC gốc để tìm: `"AC1017 Amazonite stone benchtop installed kitchen real photo"`
   - `"AC1017 Amazonite engineered stone color veining description"`
   - `"AC Stone AC1017 product specifications"`

2. **Truy cập trang nhà sản xuất** (dùng `read_url_content`):
   - `https://acstone.com.au/product/[[PRODUCT_SLUG]]/`
   - Lấy: mô tả chính thức, thông số, ảnh ứng dụng thực tế

3. **Phân tích & tổng hợp**:
   - Màu sắc chính xác (VD: "seafoam green with cool steely tones")
   - Loại vân (VD: "mahogany and golden butterscotch flecks")
   - Đặc tính đặc biệt (VD: "translucent, backlit capable")
   - Sự khác biệt giữa slab và lắp đặt thực tế

4. **Kết hợp** web research + ảnh user gửi → tạo `STONE_DESCRIPTION` chính xác

> **Quan trọng:** Ảnh slab trong xưởng khác rất nhiều khi lắp đặt (ánh sáng, góc, kích thước). Agent cần hiểu cả hai.

---

## BƯỚC 1: TẠO STONE DESCRIPTION CHUẨN

Template (dùng chung cho mọi prompt):
```
[[STONE_NAME]] is a [[COLOR_DESCRIPTION]] [[STONE_TYPE]] with [[VEINING_DESCRIPTION]], [[FINISH]] finish, [[THICKNESS]], CSF compliant, ideal for modern Melbourne [[APPLICATION]].
```

Agent lưu biến: `STONE_NAME`, `STONE_DESCRIPTION`, `STONE_IMAGE_URL`, `STONE_CODE` (VP code), `AC_CODE` (AC code gốc)

---

## BƯỚC 2: CHỌN CẢNH (SCENE ROTATION)

Agent xoay vòng qua 12 cảnh, ghi lại vào `docs/content-log.json`:

| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 1 | `kitchen-island` | Đảo bếp lớn | modern Australian kitchen, island benchtop |
| 2 | `kitchen-l-shape` | Bếp chữ L | L-shaped kitchen, timber cabinetry |
| 3 | `bathroom-vanity` | Lavabo đôi | bathroom double vanity, frameless mirror |
| 4 | `bathroom-shower` | Tường đá shower | bathroom shower niche, stone wall cladding |
| 5 | `laundry` | Phòng giặt | laundry benchtop, undermount sink |
| 6 | `outdoor-bbq` | Bếp ngoài trời | outdoor kitchen, BBQ area, Melbourne backyard |
| 7 | `fireplace` | Lò sưởi | fireplace surround, living room |
| 8 | `close-up-detail` | Cận cảnh mép đá | close-up edge detail, coffee cup |

**Single mode**: chọn 4 cảnh tiếp theo + 1 close-up + 1 slab gốc = 6 ảnh
**Multi mode**: chọn 1 cảnh chính + 1 close-up/mẫu = 2 ảnh/mẫu

---

## BƯỚC 3: TẠO KỊCH BẢN GEN ẢNH

### === ASPECT RATIO CHÍNH XÁC ===

**Google Flow** (https://labs.google/fx/tools/flow):
`16:9` | `4:3` | `1:1` | `3:4` | `9:16`

**Meta AI** (https://meta.ai):
`16:9` | `1:1` | `9:16`

**Kích thước tối ưu Facebook:**
| Loại | Ratio | Kích thước | Mục đích |
|------|-------|-----------|----------|
| Feed Post (tối ưu nhất) | **3:4** | 1080×1440 | Feed engagement cao nhất |
| Feed Post (vuông) | **1:1** | 1080×1080 | Ổn định, đều, carousel |
| Stories/Reels | **9:16** | 1080×1920 | Full-screen vertical |
| Cover/Banner | **16:9** | 1200×628 | Link preview, cover photo |

> **Khuyến nghị:** Dùng **3:4 (Google Flow)** cho ảnh feed chính, **1:1** cho carousel và Meta AI.

---

### 3A: GEN ẢNH BẰNG GOOGLE FLOW (Ảnh chính – chất lượng cao)

#### 📖 HƯỚNG DẪN TỪNG BƯỚC – GOOGLE FLOW:

```
BƯỚC 1: Mở Chrome → vào: https://labs.google/fx/tools/flow
BƯỚC 2: Đăng nhập Google Account (Gmail)
BƯỚC 3: Click "Create" hoặc "New Project"
BƯỚC 4: Giao diện hiện ra:
         ┌─────────────────────────────────────────────┐
         │  [🖼️ Add Reference]  [📝 Prompt Box]        │
         │                                             │
         │  Aspect: [16:9] [4:3] [1:1] [3:4] [9:16]   │
         │                                             │
         │              [✨ Generate]                   │
         └─────────────────────────────────────────────┘
BƯỚC 5: Click "Add Reference" / "Upload Image"
        → Upload ảnh slab đá (từ link Cloudinary hoặc file local)
BƯỚC 6: Chọn Aspect Ratio → "3:4" (tối ưu FB Feed)
BƯỚC 7: Copy prompt → paste vào ô Prompt
BƯỚC 8: Click "Generate" → chờ 10-30 giây
BƯỚC 9: Xem kết quả:
        - OK → click "Download" / "Export" (PNG/JPG)
        - Chưa ưng → click "Refine"/"Edit" để chỉnh
BƯỚC 10: Lặp lại BƯỚC 6-9 cho từng prompt (đổi aspect ratio nếu cần)
```

#### ⚡ PROMPT TEMPLATES:

**Template A – Hero Scene (kitchen/bathroom/laundry/outdoor):**
```text
Create ONE SINGLE photorealistic interior photo (not a collage, not split-screen, not side-by-side).

Use the uploaded stone sample as the exact benchtop material.
The stone is [[STONE_NAME]]: [[STONE_DESCRIPTION]].
Keep the colour, veining and finish identical to the reference stone.

Show a modern Australian [[SCENE_DESCRIPTION]] in a Melbourne home.
[[SCENE_DETAILS]]

Ultra-realistic interior photography, natural light from large windows, subtle imperfections on surfaces, warm ambient lighting, real project photo taken by a professional stonemason company.
[[ASPECT_RATIO]] composition, one single scene only.
No AI artifacts, no plastic look, no CGI render feel.
```

**Template B – Close-up:**
```text
Create ONE photorealistic close-up of a [[STONE_NAME]] benchtop edge.
The stone: [[STONE_DESCRIPTION]].

Show edge profile (pencil round, 20mm thickness) with natural light on veining and surface.
Styled with: ceramic coffee cup, small herb plant, wooden chopping board.

Macro photography, shallow depth of field, warm natural light, editorial quality.
1:1 square composition. No AI artifacts, no plastic look.
```

---

### 3B: GEN ẢNH BULK BẰNG META AI + AUTO META

#### 📖 HƯỚNG DẪN TỪNG BƯỚC – AUTO META:

```
═══ CÀI ĐẶT (chỉ lần đầu) ═══
BƯỚC 1: Mở Chrome → vào chromewebstore.google.com
BƯỚC 2: Search "Meta Automator" → click "Add to Chrome"
BƯỚC 3: Click icon 🧩 trên toolbar → Pin 📌 Meta Automator
BƯỚC 4: Vào chrome://settings/downloads
         → Tắt "Ask where to save each file"
         → Đặt thư mục: AI-Media/[[STONE_CODE]]/images-meta

═══ SỬ DỤNG ═══
BƯỚC 5: Vào https://meta.ai → đăng nhập Facebook
BƯỚC 6: Click icon Auto Meta trên toolbar
         → Overlay hiện lên:
         ┌──────────────────────────────────┐
         │ Auto Meta Automator              │
         │ ⚙️ Settings | + Add | ▶️ Start  │
         └──────────────────────────────────┘
BƯỚC 7: ⚙️ Settings:
         ✅ Auto-Download: ON
         ⏱️ Wait time: 15-20 giây
         ✅ Stealth Mode: ON (nếu có)
BƯỚC 8: Click "+ Add Prompt" → chọn Type: Image
BƯỚC 9: Paste prompt → lặp lại cho các prompt còn lại
BƯỚC 10: Click "▶️ Start" → chờ máy chạy tự động
BƯỚC 11: Kiểm tra thư mục AI-Media/[[STONE_CODE]]/images-meta
```

> **Meta AI chỉ hỗ trợ: 16:9 | 1:1 | 9:16** — dùng 1:1 cho feed post, 9:16 cho Stories.

---

## BƯỚC 4: TẠO KỊCH BẢN GEN VIDEO (2 video)

### 4A: VIDEO – META AI + AUTO META

```
BƯỚC 1: Trong Auto Meta → click "+ Add Prompt"
BƯỚC 2: ⚠️ Chọn Type: "VIDEO" (không phải Image)
BƯỚC 3: Paste prompt video
BƯỚC 4: Click "▶️ Start" → chờ 30-60 giây
BƯỚC 5: Video tự tải về
```

**Video Prompt Template:**
```text
A slow cinematic camera pan across a modern Melbourne kitchen with [[STONE_NAME]] benchtops: [[STONE_DESCRIPTION]]. Camera moves smoothly left to right along benchtop, showing surface texture and veining in natural daylight. Subtle depth of field, warm morning light. Photorealistic, stable camera, no shake. 5 seconds.
```

### 4B: VIDEO – GOOGLE FLOW ANIMATE

```
BƯỚC 1: Mở https://labs.google/fx/tools/flow
BƯỚC 2: Chọn ảnh hero đã gen → hoặc upload lại
BƯỚC 3: Click "Animate" / "Create Video"
         ┌─────────────────────────────────────────┐
         │  [🖼️ Starting Frame] [📝 Motion Prompt] │
         │  Duration: [3s] [5s] [8s]               │
         │           [✨ Generate Video]            │
         └─────────────────────────────────────────┘
BƯỚC 4: Upload ảnh hero làm Starting Frame
BƯỚC 5: Chọn Duration: 5 giây
BƯỚC 6: Paste prompt chuyển động
BƯỚC 7: Click "Generate Video" → chờ 1-2 phút
BƯỚC 8: Download → lưu vào AI-Media/[[STONE_CODE]]/videos-flow/
```

**Video Prompt:**
```text
Smooth 5-second camera push-in towards the [[STONE_NAME]] benchtop, slowly revealing surface texture and veining. Soft natural daylight, shallow depth of field. Cinematic, stable camera, no sudden movements.
```

---

## BƯỚC 5: TẠO CAPTION FACEBOOK (TIẾNG ANH)

> **⚠️ QUAN TRỌNG: Tất cả caption phải bằng tiếng Anh** (thị trường Úc/Melbourne)

### 5A: Caption cho từng ảnh riêng (image caption)

Mỗi ảnh/video khi đăng FB cần có caption riêng ngắn gọn:

```text
Ảnh hero kitchen:    "[[STONE_NAME]] — Bringing elegance to this Melbourne kitchen. Polished finish, natural beauty. 💎 #StoneBenchtops #Melbourne"
Ảnh bathroom:        "[[STONE_NAME]] — Luxury bathroom vanity with stunning veining. 🛁 #BathroomDesign #StoneVanity"
Ảnh close-up:        "The details make all the difference — [[STONE_NAME]] up close. ✨ #StoneDetails #NaturalBeauty"
Ảnh slab:            "Meet [[STONE_NAME]] — available now at our Sunshine North showroom. 📍 #PremiumStone #NewArrival"
Video pan:           "Walk through this stunning [[STONE_NAME]] kitchen installation. 🎥 #KitchenDesign #StoneKitchen"
Video close-up:      "Feel the texture — [[STONE_NAME]] in natural light. 🌿 #StoneTexture #InteriorDesign"
```

### 5B: Caption bài đăng chính (SINGLE MODE – 1 mẫu)

```text
✨ [[STONE_NAME]] – [[HEADLINE_ENGLISH]] ✨

[[1-2 SENTENCE_DESCRIPTION_ENGLISH]]

💎 Key Features:
✅ [[FEATURE_1]]
✅ [[FEATURE_2]]
✅ [[FEATURE_3]]
✅ CSF Compliant – Safe for your family

🏡 Perfect for: [[Kitchen Benchtops / Bathroom Vanities / Islands / Splashbacks]]

📩 DM us or call for a FREE quote today!

#VPStoneMason #StoneBenchtops #Melbourne #KitchenDesign #BathroomDesign #StoneInstallation #EngineeredStone #AustralianHomes #HomeRenovation #MelbourneHomes #Benchtops #[[STONE_HASHTAG]] #CSFStone #PremiumStone #InteriorDesign

— — — — —
🏢 PVstoneau - Premium Stone Benchtops Melbourne
📍 Showroom: 32 Spalding Ave Sunshine North VIC
📞 Phone: 0424 439 293
✉️ Email: info@vpstonemason.com.au
🌐 Website: https://vpstonemason.vercel.app/
🕒 Opening Hours:
Mon–Fri: 9:00 AM – 5:00 PM
Sat: 10:00 AM – 2:00 PM
```

### 5C: Caption bài đăng chính (MULTI MODE – 2-5 mẫu)

```text
✨ [[COLLECTION_NAME]] Collection – [[NUMBER]] Premium Stones for Your Dream Home ✨

Explore our [[NUMBER]] newest arrivals from [[COLLECTION_NAME]]:

🔹 [[STONE_1_NAME]]: [[SHORT_DESC_1]]
🔹 [[STONE_2_NAME]]: [[SHORT_DESC_2]]
🔹 [[STONE_3_NAME]]: [[SHORT_DESC_3]]
🔹 [[STONE_4_NAME]]: [[SHORT_DESC_4]]
🔹 [[STONE_5_NAME]]: [[SHORT_DESC_5]]

All CSF Compliant ✅ | Available for viewing at our showroom

📩 DM us or call 0424 439 293 for a FREE quote!

#VPStoneMason #StoneBenchtops #Melbourne #KitchenDesign #BathroomDesign #EngineeredStone #AustralianHomes #HomeRenovation #MelbourneHomes #PremiumStone #CSFStone #InteriorDesign #[[STONE_1_HASHTAG]] #[[STONE_2_HASHTAG]] #[[STONE_3_HASHTAG]]

— — — — —
🏢 PVstoneau - Premium Stone Benchtops Melbourne
📍 Showroom: 32 Spalding Ave Sunshine North VIC
📞 Phone: 0424 439 293
✉️ Email: info@vpstonemason.com.au
🌐 Website: https://vpstonemason.vercel.app/
🕒 Opening Hours:
Mon–Fri: 9:00 AM – 5:00 PM
Sat: 10:00 AM – 2:00 PM
```

---

## BƯỚC 6: OUTPUT CHECKLIST

### Single mode (1 mẫu):
```
📋 CHECKLIST – [[STONE_NAME]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ ẢNH (6 ảnh):
  □ Ảnh 1: Hero Scene (3:4 – 1080×1440) ← Google Flow
  □ Ảnh 2: Scene 2 (3:4 – 1080×1440) ← Google Flow
  □ Ảnh 3: Scene 3 (1:1 – 1080×1080) ← Google Flow
  □ Ảnh 4: Scene 4 (3:4 – 1080×1440) ← Google Flow
  □ Ảnh 5: Close-up (1:1 – 1080×1080) ← Google Flow
  □ Ảnh 6: Slab gốc (1:1 – 1080×1080) ← Ảnh gốc resize

🎬 VIDEO (2 video):
  □ Video 1: Camera pan (5 giây) ← Meta AI
  □ Video 2: Push-in (5 giây) ← Google Flow Animate

📝 CAPTION:
  □ 1 caption bài đăng chính (tiếng Anh)
  □ 6 caption riêng cho từng ảnh (tiếng Anh)
  □ 2 caption riêng cho video (tiếng Anh)
  □ Thông tin PVstoneau: ✅
```

### Multi mode (2-5 mẫu):
```
📋 CHECKLIST – [[NUMBER]] STONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ ẢNH (2 ảnh × [[NUMBER]] mẫu = [[TOTAL]] ảnh):
  Mỗi mẫu: 1 hero scene (3:4) + 1 close-up/slab (1:1)

🎬 VIDEO (1 video tổng):
  □ Slideshow hoặc pan video kết hợp các mẫu

📝 CAPTION:
  □ 1 caption bài đăng chính (multi format, tiếng Anh)
  □ [[TOTAL]] caption riêng cho từng ảnh (tiếng Anh)
  □ 1 caption video (tiếng Anh)
  □ Thông tin PVstoneau: ✅
```

---

## BƯỚC 7 (TỰ ĐỘNG): CẬP NHẬT CONTENT LOG

Agent cập nhật `docs/content-log.json` sau khi hoàn thành.

---

## QUY TẮC PROMPT (MỌI PROMPT)

1. ✅ Luôn có: `photorealistic`, `real project photo`, `not CGI`, `Australian home`, `Melbourne`
2. ❌ Không bao giờ: `hyper-detailed 8K`, `ultra HD`, `fantasy`, `artistic`, `anime`, `cartoon`
3. ✅ Thêm chi tiết sống: fruit bowl, cookbook, coffee cup, towel
4. 💡 Ánh sáng: `natural daylight`, `morning light`, `window light`
5. 📐 Mỗi prompt = 1 ảnh: `ONE SINGLE photo, not a collage, not split-screen`
6. 📏 Kích thước FB: Feed 3:4 (1080×1440) hoặc 1:1 (1080×1080), Stories 9:16
7. 🎨 Nhất quán: dùng cùng `STONE_DESCRIPTION` cho tất cả prompt
8. 🎥 Video: `stable camera`, `smooth movement`, `no sudden cuts`

---

## CẤU TRÚC THƯ MỤC

```
/AI-Media/
  /[[STONE_CODE]]/
    /images-flow/     ← Ảnh từ Google Flow
    /images-meta/     ← Ảnh từ Meta AI
    /videos-flow/     ← Video từ Google Flow Animate
    /videos-meta/     ← Video từ Meta AI
    /prompts.txt      ← Prompt đã dùng
    /caption.txt      ← Caption đã tạo
```
