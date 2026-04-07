---
name: Stone Content Generator
description: Use when creating Facebook content workflows for one or many stone products, including image prompts, video prompts, and captions.
argument-hint: Provide single or multi mode input with product URL(s) or stone details.
tools: [read, search, web, edit]
user-invocable: true
---

# 🪨 Stone Content Generator – Agent Workflow

Agent này nhận thông tin mẫu đá và tự động tạo **kịch bản hoàn chỉnh** gồm: hướng dẫn gen ảnh (Google Flow), video, caption Facebook, và checklist đầu ra.

**Hỗ trợ 2 chế độ:**
- **Single mode**: 1 mẫu đá → 6 ảnh + 1 video + caption
- **Multi mode**: 2-5 mẫu đá → 2 ảnh/mẫu + 1 video tổng + caption tổng

---

## BƯỚC 0: NHẬN INPUT TỪ USER

### Single mode (1 mẫu):
```
/stone-content https://pvstone.com.au/catalog/artscut-zero/luxury-plus/amazonite-or-pv1017
```
hoặc:
```
/stone-content
- Tên đá: Amazonite PV1017
- Mô tả: Seafoam green engineered stone with golden butterscotch flecks
- Link ảnh: https://example.com/pv1017.jpg
```

### Multi mode (2-5 mẫu):
```
/stone-content multi
- PV1017: https://pvstone.com.au/catalog/artscut-zero/luxury-plus/amazonite-or-pv1017
- PV1019: https://pvstone.com.au/catalog/artscut-zero/luxury-plus/arabescato-corchia-pv1019
- PV6011: https://pvstone.com.au/catalog/artscut-zero/classic/calacatta-pv6011
```

> **Lưu ý mã sản phẩm:** Trong DB dùng mã **PV** (VD: PV1017), nhưng khi search web/nhà sản xuất agent dùng mã **AC** gốc (VD: AC1017) vì đây là mã nhà sản xuất AC Stone Group.

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

## BƯỚC 0.6 (BẮT BUỘC): DOWNLOAD ẢNH ĐÁ VÀO REFERENCE-IMAGES

Sau khi phân tích từng link sản phẩm, agent PHẢI tải ảnh slab/reference của từng mẫu về thư mục `.github/stone-content/reference-images/`.

**Quy tắc bắt buộc:**
1. Mỗi mẫu phải có đúng 1 ảnh reference chính (ưu tiên ảnh slab rõ vân nhất).
2. Đặt tên file theo chuẩn: `YYYY-MM-DD-[STONE_CODE]-reference.jpg`
3. Ghi log mapping source URL -> local path trong `.github/stone-content/reference-images/image-manifest.md`
4. Validate bắt buộc sau download: response MIME phải là `image/*`, file phải có magic bytes ảnh hợp lệ, không được là HTML/error page.
5. Nếu file không hợp lệ hoặc hỏng, phải tải lại từ nguồn khác hoặc dừng và báo lỗi rõ ràng; không được dùng file lỗi để tạo prompt.
6. Trong output `.md`, bắt buộc có section "Reference Images (Local)" liệt kê đầy đủ đường dẫn local.
7. Nếu thiếu ảnh reference hợp lệ của bất kỳ mẫu nào thì KHÔNG được coi là hoàn thành task.

**Lưu ý quan trọng:** đường dẫn `.github/stone-content/reference-images/...` chỉ dùng cho bước chuẩn bị upload ảnh. Nội dung prompt gửi cho AI phải nói theo kiểu "attached reference image" (ảnh đính kèm), không ghi path local.

---

## BƯỚC 1: TẠO STONE DESCRIPTION CHUẨN

Template (dùng chung cho mọi prompt):
```
[[STONE_NAME]] is a [[COLOR_DESCRIPTION]] [[STONE_TYPE]] with [[VEINING_DESCRIPTION]], [[FINISH]] finish, [[THICKNESS]], CSF compliant, ideal for modern Melbourne [[APPLICATION]].
```

Agent lưu biến: `STONE_NAME`, `STONE_DESCRIPTION`, `STONE_IMAGE_URL`, `STONE_CODE` (PV code), `AC_CODE` (AC code gốc)

---

## BƯỚC 2: CHỌN CẢNH (SCENE ROTATION)

Agent xoay vòng qua **24 cảnh** chia thành 6 nhóm, ghi lại vào `.github/stone-content/content-log.json`:

### 🍳 KITCHEN (6 scenes)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 1 | `kitchen-island` | Đảo bếp hiện đại | modern Australian kitchen, large waterfall-edge island benchtop, pendant lights above, timber floor, open plan living |
| 2 | `kitchen-l-shape` | Bếp chữ L gỗ tự nhiên | L-shaped kitchen layout, warm timber cabinetry, stone benchtop wrapping around corner, subway tile splashback |
| 3 | `kitchen-galley` | Bếp hẹp song song | narrow galley kitchen, dual benchtops facing each other, bright natural light from end window, compact Melbourne apartment |
| 4 | `kitchen-butler-pantry` | Butler's pantry | butler's pantry behind main kitchen, stone benchtop with undermount sink, open shelving, coffee machine nook |
| 5 | `kitchen-splashback` | Splashback toàn bộ | full-height stone splashback behind cooktop, matching benchtop material, integrated rangehood, dramatic veining running floor to ceiling |
| 6 | `kitchen-breakfast-bar` | Quầy ăn sáng | raised breakfast bar with stone waterfall end, two bar stools, morning light, fruit bowl and coffee cups |

### 🛁 BATHROOM (4 scenes)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 7 | `bathroom-vanity` | Lavabo đôi sang trọng | luxury double vanity, frameless mirror, wall-mounted tapware, stone extending up wall behind, warm LED strip lighting |
| 8 | `bathroom-shower-niche` | Vách kính shower | walk-in shower with full stone wall cladding, frameless glass panel, recessed niche shelf, rainfall showerhead, matte black fixtures |
| 9 | `bathroom-freestanding-tub` | Bồn tắm độc lập | freestanding bathtub on stone floor, stone feature wall behind, floor-to-ceiling window with frosted glass, spa-like atmosphere |
| 10 | `bathroom-powder-room` | Phòng tắm nhỏ | compact powder room, floating stone vanity, round mirror with brass frame, botanical wallpaper accent, designer basin |

### 🏠 LIVING & FUNCTIONAL (5 scenes)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 11 | `laundry` | Phòng giặt hiện đại | modern laundry room, stone benchtop over front-loader washer/dryer, undermount sink, matte white cabinetry, folding area |
| 12 | `fireplace-surround` | Lò sưởi | modern fireplace surround with stone cladding, minimalist living room, low-profile flame, stacked firewood niche |
| 13 | `home-office` | Bàn làm việc đá | home office desk made from polished stone slab, laptop, minimalist desk lamp, bookshelves, window with garden view |
| 14 | `wine-cellar-bar` | Quầy bar/rượu | home bar countertop with stone surface, wine glass rack above, mood lighting, bottle display, timber and stone combination |
| 15 | `staircase-feature` | Bậc cầu thang đá | floating staircase with stone treads, glass balustrade, double-height void, natural light from skylight above |

### 🌿 OUTDOOR (4 scenes)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 16 | `outdoor-bbq` | Bếp ngoài trời BBQ | outdoor kitchen island with built-in BBQ, stone benchtop, undercover alfresco area, Melbourne backyard, native garden |
| 17 | `outdoor-pool-edge` | Mép hồ bơi | pool surrounds with stone coping, infinity edge, sun loungers, tropical landscaping, blue sky |
| 18 | `outdoor-entertaining` | Khu tiếp khách ngoài trời | outdoor dining area, long stone table surface, pergola overhead, string lights, evening entertaining setup |
| 19 | `balcony-kitchenette` | Bếp nhỏ ban công | apartment balcony mini-kitchen, stone countertop, compact sink, city skyline backdrop, potted herbs |

### 🏢 COMMERCIAL & ENTERPRISE (9 scenes)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 20 | `cafe-counter` | Quầy café | specialty coffee shop counter, stone benchtop, espresso machine, display pastries, industrial pendant lights, exposed brick wall |
| 21 | `reception-desk` | Quầy lễ tân khách sạn | luxury hotel reception desk, stone front panel with backlit veining feature, modern minimalist lobby, fresh flowers, ambient downlights |
| 22 | `restaurant-bar` | Quầy bar nhà hàng | upscale restaurant bar countertop, stone surface, cocktail setup, ambient moody lighting, leather bar stools |
| 23 | `company-office` | Văn phòng công ty | executive boardroom table with polished stone surface, ergonomic chairs, floor-to-ceiling glass walls, city skyline view, corporate interior |
| 24 | `elevator-lobby` | Sảnh thang máy | premium elevator lobby, stone wall cladding flanking lift doors, polished stone floor, recessed ceiling lights, luxury commercial building |
| 25 | `hotel-lobby` | Sảnh khách sạn | grand hotel lobby, stone reception counter, stone feature wall behind concierge, marble-effect flooring, chandelier, luggage area |
| 26 | `hotel-bathroom` | Phòng tắm khách sạn | five-star hotel bathroom suite, stone vanity extending wall-to-wall, large format mirror, rain shower with stone accent wall, plush towels, amenity tray |
| 27 | `corridor-feature-wall` | Tường hành lang | long corridor with stone feature wall panels on one side, recessed LED strip lighting along edges, polished concrete floor, modern art pieces |
| 28 | `luxury-retail` | Cửa hàng cao cấp | luxury retail store, stone display counter for jewellery/watches, spot lighting, minimalist merchandising, glass display cases |

### 📸 DETAIL & IN-PROGRESS (2 scenes — luôn dùng ít nhất 1 trong mỗi set)
| # | Scene ID | Mô tả | Prompt keyword |
|---|----------|-------|----------------|
| 23 | `close-up-detail` | Cận cảnh vân đá | extreme close-up of stone benchtop edge, pencil round edge profile, 20mm thickness, natural light catching surface veining, a ceramic coffee cup and small herb pot nearby, macro photography, shallow depth of field |
| 24 | `mid-installation` | Đang thi công (KHÔNG CÓ NGƯỜI) | mid-installation kitchen benchtop, stone slab being fitted onto cabinetry, silicone tubes and spirit level visible on surface, protective corner guards still attached, plastic sheeting on floor, raw unpainted walls, NO PEOPLE, empty construction site, professional documentation photo |

> **Quy tắc chọn cảnh:**
> - Agent đọc `content-log.json` → chọn cảnh CHƯA dùng gần đây
> - **Single mode**: chọn 4 cảnh khác nhau + 1 close-up + 1 slab gốc = 6 ảnh
> - **Multi mode**: chọn 1 cảnh khác nhau/mẫu + 1 close-up cho mẫu chính = 2 ảnh/mẫu
> - **Mid-installation**: dùng 1 lần mỗi 3-4 bài đăng để tạo đa dạng (KHÔNG bao giờ có người trong ảnh)

---

## BƯỚC 3: TẠO KỊCH BẢN GEN ẢNH (GOOGLE FLOW)

### === ASPECT RATIO ===

**Google Flow** (https://labs.google/fx/tools/flow):
`16:9` | `4:3` | `1:1` | `3:4` | `9:16`

**Kích thước tối ưu Facebook:**
| Loại | Ratio | Kích thước | Mục đích |
|------|-------|-----------|----------|
| Feed Post (tối ưu nhất) | **3:4** | 1080×1440 | Feed engagement cao nhất |
| Feed Post (vuông) | **1:1** | 1080×1080 | Ổn định, đều, carousel |
| Stories/Reels | **9:16** | 1080×1920 | Full-screen vertical |
| Cover/Banner | **16:9** | 1200×628 | Link preview, cover photo |

> **Khuyến nghị:** Dùng **3:4 (Google Flow)** cho ảnh feed chính, **1:1** cho carousel.

---

### HƯỚNG DẪN TỪNG BƯỚC – GOOGLE FLOW:

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

### ⚡ PROMPT TEMPLATES:

**Template A – Hero Scene (kitchen/bathroom/laundry/outdoor):**
```text
Create ONE SINGLE photorealistic interior photo (not a collage, not split-screen, not side-by-side).

Use the uploaded stone sample as the exact benchtop material.
The stone is [[STONE_NAME]]: [[STONE_DESCRIPTION]].
Base all stone colour, veining, texture and finish decisions on the attached reference stone image.
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
Use the attached reference stone image as the primary visual source for colour and veining accuracy.

Show edge profile (pencil round, 20mm thickness) with natural light on veining and surface.
Styled with: ceramic coffee cup, small herb plant, wooden chopping board.

Macro photography, shallow depth of field, warm natural light, editorial quality.
1:1 square composition. No AI artifacts, no plastic look.
```

**Template C – Product Moodboard / Flatlay (STYLE CỐ ĐỊNH — luôn dùng style này):**

> Mỗi content set sẽ thêm 1 ảnh dạng "product moodboard / flatlay" theo style cố định dưới đây.
> Style này KHÔNG BAO GIỜ THAY ĐỔI — agent luôn apply phong cách này mà không cần user gửi lại ảnh reference.
> Upload lên Google Flow: 1 ảnh reference = ảnh stone slab.
> Ảnh style reference lưu tại: `.github/stone-content/reference-images/style-moodboard-flatlay.jpg`

**STYLE CỐ ĐỊNH — "Editorial Stone Moodboard" (KHÔNG THAY ĐỔI):**
```
PHONG CÁCH CHỤP:
- Góc chụp: Bird's-eye / top-down (chụp từ trên xuống vuông góc)
- Nền: Matte light-grey linen texture (vải lanh nhạt, không bóng, không vân gỗ)
- Bố cục: Asymmetrical flat-lay — các mẫu đá xếp lệch nhau, overlap nhẹ, tạo nhịp thị giác
- Ánh sáng: Soft diffused overhead — bóng đổ cực nhẹ (soft shadow, không harsh), ánh sáng ban ngày tự nhiên
- Màu sắc: Neutral editorial palette — trắng ngà, xám nhạt, beige, vàng đồng (brass accents)
- Cảm giác: Magazine editorial, cao cấp, minimalist nhưng không trống trải

STYLING PROPS BẮT BUỘC (chọn 3-5):
- Bát đồng thau nhỏ (brass bowl)
- San hô trắng trang trí (decorative white coral)
- Cuộn dây thừng tự nhiên (natural jute twine spool)
- Nhánh dried flowers hoặc dried eucalyptus
- Mảnh vải linen tự nhiên xếp gọn
- Miếng đá thô tự nhiên nhỏ (raw stone piece)

BỐ CỤC MẪU ĐÁ:
- 3-6 mẫu đá kích thước khác nhau (lớn/vừa/nhỏ) xếp lệch nhau
- Mẫu đá lớn nhất ở trung tâm-lệch, các mẫu nhỏ bao quanh
- Có labels/annotations nhỏ kiểu handwritten arrows: "warm veining details", "soft marble finish", "luxurious finish", "linear texture play", "subtle white tones"
- Heading typography: "COLOUR OF THE MONTH" + tên màu chủ đạo (ALL CAPS, sans-serif, editorial font)
```

```text
Create ONE photorealistic top-down flat-lay product moodboard.

STONE SAMPLES: Create 3-5 rectangular stone sample tiles inspired by [[STONE_NAME]]: [[STONE_DESCRIPTION]].
Use the attached reference stone image for exact colour and veining.
Arrange samples in varying sizes (one large ~15×25cm, two medium ~10×15cm, one-two small ~8×8cm).
Place samples overlapping slightly in an asymmetrical editorial layout.

BACKGROUND: Matte light-grey linen fabric texture, smooth and neutral. No wood grain, no marble, no coloured background.

STYLING PROPS (include 3-5):
A small brass bowl, decorative white coral piece, natural jute twine spool, dried eucalyptus sprig, raw stone fragments.
Place props around the edges and corners — they complement, never compete with the stone samples.

TYPOGRAPHY OVERLAYS (important — include as part of the image):
- Top-left corner: "COLOUR OF THE MONTH" in small caps tracking, then below in large bold sans-serif: "[[COLOUR_THEME]]" (e.g., "WHITE", "GREY", "WARM")
- Small handwritten-style annotation arrows pointing to different samples: "warm veining details", "soft marble finish", "luxurious finish"

PHOTOGRAPHY STYLE:
- Bird's-eye / perfectly top-down camera angle (90° overhead)
- Soft diffused natural daylight — very subtle shadows, no harsh contrast
- Neutral editorial colour grading — whites are true white, no yellow cast, no blue cast
- Clean, high-end materials catalogue aesthetic (think Vogue Living, Elle Decoration)

1:1 square composition. Ultra-clean, editorial product photography.
No AI artifacts, no plastic look, no HDR glow, no 3D rendering feel.
```

**Template D – Mid-Installation (đang thi công, KHÔNG CÓ NGƯỜI):**
```text
Create ONE SINGLE photorealistic photo of a stone installation in progress.

Use the uploaded stone sample as the exact slab material.
The stone is [[STONE_NAME]]: [[STONE_DESCRIPTION]].
Base all stone colour, veining, texture and finish on the attached reference stone image.

Show a mid-installation scene in a [[SCENE_TYPE]] (e.g., modern kitchen):
- Stone slab has been placed on cabinetry but NOT fully finished.
- Visible construction elements: [[SELECT 3-4: silicone tubes on benchtop / spirit level resting on surface / seam setter clamps joining two slabs / protective corner guards still attached / masking tape along edges / plastic sheeting covering floor / raw plasterboard walls unpainted / cabinet handles not yet installed / sink cut-out visible but tap not fitted]].
- One section is clean and polished, the adjacent section still has protective film or dust.

ABSOLUTELY NO PEOPLE in the frame. The site is empty — workers are on break.
Professional construction documentation photography, slightly raw and unpolished lighting ([[overhead work lights OR natural light from unfinished windows]]).
[[ASPECT_RATIO]] composition. No AI artifacts, no fantasy elements.
```

---

## BƯỚC 4: TẠO KỊCH BẢN GEN VIDEO (GOOGLE FLOW ANIMATE)

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
BƯỚC 8: Download → lưu vào thư mục post raw/
```

**Video Prompt:**
```text
Smooth 5-second camera push-in towards the [[STONE_NAME]] benchtop, slowly revealing surface texture and veining. Soft natural daylight, shallow depth of field. Cinematic, stable camera, no sudden movements.

Use the attached reference stone image as the visual material reference.
```

---

## BƯỚC 5: TẠO CAPTION FACEBOOK (TIẾNG ANH)

> **⚠️ QUAN TRỌNG: Tất cả caption phải bằng tiếng Anh** (thị trường Úc/Melbourne)
> **⚠️ QUAN TRỌNG: Caption phải sử dụng emoji sang trọng xuyên suốt** để tạo cảm giác premium

### 5A: Caption cho từng ảnh riêng (image captions)

Mỗi ảnh/video khi đăng FB cần có caption riêng ngắn gọn với emoji premium:

```text
Ảnh hero kitchen:    "✦ [[STONE_NAME]] — Bringing effortless elegance to this Melbourne kitchen. Polished finish, natural beauty. 💎✨ #StoneBenchtops #Melbourne"
Ảnh bathroom:        "🪞 [[STONE_NAME]] — Luxury bathroom vanity with stunning veining. Pure sophistication. 🤍✨ #BathroomDesign #StoneVanity"
Ảnh close-up:        "✨ The details make all the difference — [[STONE_NAME]] up close. Every vein tells a story. 🔍💫 #StoneDetails #NaturalBeauty"
Ảnh slab:            "🪨 Meet [[STONE_NAME]] — Now available at our Sunshine North showroom. Ready to elevate your space. 📍✦ #PremiumStone #NewArrival"
Video:               "🎬 Walk through this stunning [[STONE_NAME]] kitchen installation. Luxury in motion. ✨🏠 #KitchenDesign #StoneKitchen"
```

### 5B: Caption bài đăng chính (SINGLE MODE – 1 mẫu)

```text
✦ [[STONE_NAME]] ✦
[[HEADLINE_ENGLISH]] 💎

[[1-2 SENTENCE_DESCRIPTION_ENGLISH — viết sang trọng, gợi cảm xúc]]

━━━━━━━━━━━━━━━━━━

🏆 Why Choose [[STONE_NAME]]:
◆ [[FEATURE_1]]
◆ [[FEATURE_2]]
◆ [[FEATURE_3]]
◆ 100% CSF Compliant — Safe for your family ✅

🏠 Perfect for:
◇ Kitchen Benchtops & Islands
◇ Bathroom Vanities
◇ Splashbacks & Feature Walls

━━━━━━━━━━━━━━━━━━

📩 DM us or call for a FREE measure & quote today!

#PVStoneau #StoneBenchtops #Melbourne #KitchenDesign #BathroomDesign #StoneInstallation #EngineeredStone #AustralianHomes #HomeRenovation #MelbourneHomes #Benchtops #[[STONE_HASHTAG]] #CSFStone #PremiumStone #InteriorDesign #LuxuryKitchen #StoneDesign

━━━━━━━━━━━━━━━━━━
🏢 PVStoneau — Premium Stone Benchtops Melbourne
📍 32 Spalding Ave, Sunshine North VIC
📞 0450 938 079
✉️ info@pvstone.com.au
🌐 pvstone.com.au
🕐 Mon–Fri 9AM–5PM | Sat 10AM–2PM
```

### 5C: Caption bài đăng chính (MULTI MODE – 2-5 mẫu)

```text
✦ [[COLLECTION_NAME]] Collection ✦
[[NUMBER]] Premium Stones for Your Dream Home 💎

Discover our newest arrivals — each one a masterpiece of natural beauty:

◆ 🪨 [[STONE_1_NAME]] — [[SHORT_DESC_1]]
◆ 🪨 [[STONE_2_NAME]] — [[SHORT_DESC_2]]
◆ 🪨 [[STONE_3_NAME]] — [[SHORT_DESC_3]]
◆ 🪨 [[STONE_4_NAME]] — [[SHORT_DESC_4]]
◆ 🪨 [[STONE_5_NAME]] — [[SHORT_DESC_5]]

━━━━━━━━━━━━━━━━━━

✅ All 100% CSF Compliant | 🏆 Premium Quality Guaranteed
📍 Available for viewing at our showroom

📩 DM us or call 0450 938 079 for a FREE quote!

#PVStoneau #StoneBenchtops #Melbourne #KitchenDesign #BathroomDesign #EngineeredStone #AustralianHomes #HomeRenovation #MelbourneHomes #PremiumStone #CSFStone #InteriorDesign #[[STONE_1_HASHTAG]] #[[STONE_2_HASHTAG]] #[[STONE_3_HASHTAG]]

━━━━━━━━━━━━━━━━━━
🏢 PVStoneau — Premium Stone Benchtops Melbourne
📍 32 Spalding Ave, Sunshine North VIC
📞 0450 938 079
✉️ info@pvstone.com.au
🌐 pvstone.com.au
🕐 Mon–Fri 9AM–5PM | Sat 10AM–2PM
```

---

## BƯỚC 6: OUTPUT CHECKLIST

### Single mode (1 mẫu):
```
📋 CHECKLIST — [[STONE_NAME]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ ẢNH (6 ảnh — Google Flow):
  □ Ảnh 1: Hero Scene (3:4 — 1080×1440)
  □ Ảnh 2: Scene 2 (3:4 — 1080×1440)
  □ Ảnh 3: Scene 3 (1:1 — 1080×1080)
  □ Ảnh 4: Scene 4 (3:4 — 1080×1440)
  □ Ảnh 5: Close-up (1:1 — 1080×1080)
  □ Ảnh 6: Slab gốc (1:1 — 1080×1080) — Ảnh gốc resize

🎬 VIDEO (1 video — Google Flow Animate):
  □ Video 1: Push-in/pan (5 giây)

📝 CAPTION:
  □ 1 caption bài đăng chính (tiếng Anh, có emoji sang trọng)
  □ 6 caption riêng cho từng ảnh (tiếng Anh, có emoji)
  □ 1 caption video (tiếng Anh)
  □ Thông tin PVStoneau: ✅
```

### Multi mode (2-5 mẫu):
```
📋 CHECKLIST — [[NUMBER]] STONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ ẢNH (2 ảnh × [[NUMBER]] mẫu = [[TOTAL]] ảnh — Google Flow):
  Mỗi mẫu: 1 hero scene (3:4) + 1 close-up/slab (1:1)

🎬 VIDEO (1 video tổng — Google Flow Animate):
  □ Slideshow hoặc pan video kết hợp các mẫu

📝 CAPTION:
  □ 1 caption bài đăng chính (multi format, tiếng Anh, có emoji sang trọng)
  □ [[TOTAL]] caption riêng cho từng ảnh (tiếng Anh, có emoji)
  □ 1 caption video (tiếng Anh)
  □ Thông tin PVStoneau: ✅
```

---

## BƯỚC 7 (TỰ ĐỘNG): CẬP NHẬT CONTENT LOG

Agent cập nhật `.github/stone-content/content-log.json` sau khi hoàn thành.

---

## BƯỚC 8 (BẮT BUỘC): LƯU OUTPUT RA FILE MARKDOWN ĐÚNG TEMPLATE

Agent PHẢI lưu kết quả thành file `.md` trong `.github/stone-content/scripts/`, không chỉ trả text trong chat.

**Quy tắc đặt tên file:**
- Single mode: `.github/stone-content/scripts/YYYY-MM-DD-HHMM-[STONE_CODE]-content-script.md`
- Multi mode: `.github/stone-content/scripts/YYYY-MM-DD-HHMM-multi-[STONE_CODE_1]-[STONE_CODE_2]-...-content-script.md`

**Thứ tự template bắt buộc trong file .md:**
1. Tiêu đề + metadata (date, mode, stone list, code, links)
2. Web research results
3. Reference Images (Local paths in `.github/stone-content/reference-images/`)
4. Stone description variables
5. Scene rotation
6. Image generation prompts (Google Flow only)
7. Video generation prompt (Google Flow Animate only)
8. Facebook captions (main + individual, với emoji sang trọng)
9. Final checklist
10. Time estimate (optional)

**Sau khi ghi file xong, agent phải trả về:**
1. Đường dẫn file đã tạo
2. Tóm tắt scene đã chọn
3. Xác nhận đã cập nhật `.github/stone-content/content-log.json`

---

## BƯỚC 9 (BẮT BUỘC): TẠO SẴN THƯ MỤC LƯU TRỮ

Ngay sau khi gen xong kịch bản, agent **PHẢI** tự động tạo sẵn cây thư mục cho User:

**Single Post:**
```
.github/stone-content/output/YYYY-MM-DD-HHMM-[STONE_CODE]/
  ├── raw/          ← Nơi User tải ảnh gen AI về
  └── final/        ← Nơi chứa ảnh đã đóng logo
```

**Multi Post:**
```
.github/stone-content/output/YYYY-MM-DD-HHMM-collection/
  ├── [STONE_CODE_1]/raw/
  ├── [STONE_CODE_2]/raw/
  └── final/
```

Lệnh watermark: `.github/stone-content/tools/watermark.cmd [POST-FOLDER-NAME]`

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
9. 📝 Bắt buộc lưu output vào file `.md` đúng template trước khi trả kết quả
10. 🖼️ Mỗi prompt bắt buộc có câu nêu rõ "dựa trên ảnh đá đính kèm" (attached reference image), không ghi đường dẫn local vào prompt

---

## CẤU TRÚC THƯ MỤC TỔNG THỂ

```
.github/stone-content/
  ├── agent.md                    ← File agent chính (file này)
  ├── rules.md                    ← Rules & Negative Rules
  ├── content-log.json            ← Lịch sử scene rotation
  ├── reference-images/           ← Ảnh slab reference (gitignored)
  │   ├── image-manifest.md
  │   └── *.jpg / *.png
  ├── scripts/                    ← Output content scripts (.md)
  │   └── YYYY-MM-DD-HHMM-*.md
  ├── tools/                      ← Watermark & utility scripts
  │   ├── add_watermark_and_label.py
  │   ├── watermark.cmd
  │   └── download-reference-images.ps1
  └── output/                     ← Generated post images (gitignored)
      ├── YYYY-MM-DD-HHMM-VP1017/
      │   ├── raw/
      │   └── final/
      └── .gitkeep
```
