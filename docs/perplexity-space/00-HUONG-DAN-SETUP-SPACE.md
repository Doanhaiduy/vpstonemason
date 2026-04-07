# 🚀 HƯỚNG DẪN THIẾT LẬP PERPLEXITY SPACE — PVStoneau

> Tài liệu này hướng dẫn bạn từng bước tạo và cấu hình một Perplexity Space hoàn chỉnh để hỗ trợ toàn diện việc kinh doanh đá cao cấp tại Úc.

---

## 📋 TỔNG QUAN CÁC TRƯỜNG CẤU HÌNH SPACE

Khi tạo Space trên Perplexity, bạn cần điền các phần sau:

| Trường | Mô tả | Bắt buộc |
|--------|--------|----------|
| **Title** | Tên Space | ✅ Có |
| **Description** | Mô tả ngắn về mục đích Space | ✅ Có |
| **Files** | Upload file tài liệu (PDF, MD, TXT, CSV, Excel) | ✅ Có |
| **Link** | Link website chính | Nên có |
| **Additional Links** | Các link bổ sung (đối thủ, tài nguyên, công cụ) | Nên có |
| **Custom Instructions** | Prompt hướng dẫn AI cách hành xử | ✅ Có |
| **Scheduled Search (Tasks)** | Tìm kiếm tự động theo lịch | Nên có |

---

## 1️⃣ TITLE (Tên Space)

```
PVStoneau — Trợ Lý Kinh Doanh Đá Cao Cấp Úc
```

> **Lưu ý:** Tên nên ngắn gọn, rõ ràng mục đích.

---

## 2️⃣ DESCRIPTION (Mô tả)

```
Space hỗ trợ toàn diện cho PVStoneau — doanh nghiệp bán đá benchtop cao cấp tại Úc (Melbourne, Victoria). Bao gồm: tư vấn sản phẩm, tạo nội dung marketing (blog, social media, quảng cáo Facebook/Instagram), trả lời khách hàng, chiến lược SEO, phân tích đối thủ, xu hướng ngành đá Úc, và quản lý website. Người quản lý/sử dụng space là người Việt nên giao tiếp bằng tiếng Việt, nhưng tất cả nội dung tạo cho khách hàng phải bằng tiếng Anh (English - Australian).
```

---

## 3️⃣ FILES (Các file tài liệu cần upload)

Upload tất cả các file `.md` trong folder `docs/perplexity-space/` (trừ file này):

| STT | File | Nội dung |
|-----|------|----------|
| 1 | `01-THONG-TIN-DOANH-NGHIEP.md` | Thông tin đầy đủ về doanh nghiệp PVStoneau |
| 2 | `02-DANH-MUC-SAN-PHAM.md` | Catalogue đầy đủ các loại đá đang bán |
| 3 | `03-BANG-GIA-VA-DICH-VU.md` | Bảng giá tham khảo và dịch vụ cung cấp |
| 4 | `04-HUONG-DAN-TRA-LOI-KHACH-HANG.md` | Script và template trả lời khách hàng |
| 5 | `05-CHIEN-LUOC-CONTENT-MARKETING.md` | Chiến lược nội dung blog, social media |
| 6 | `06-HUONG-DAN-QUANG-CAO-FACEBOOK.md` | Hướng dẫn chi tiết chạy Facebook/Instagram Ads |
| 7 | `07-SEO-VA-WEBSITE.md` | Chiến lược SEO và quản lý website |
| 8 | `08-MAU-BAI-DANG-SOCIAL-MEDIA.md` | Templates bài đăng Facebook, Instagram |
| 9 | `09-KIEN-THUC-NGANH-DA-UC.md` | Kiến thức chuyên sâu ngành đá tại Úc |
| 10 | `10-PHAN-TICH-DOI-THU.md` | Phân tích đối thủ cạnh tranh |
| 11 | `11-LICH-DANG-BAI-VA-KE-HOACH.md` | Lịch đăng bài và kế hoạch marketing |
| 12 | `12-THUAT-NGU-NGANH-DA.md` | Thuật ngữ Anh-Việt ngành đá |

---

## 4️⃣ LINK (Link chính)

### Website:
```
https://pvstone.com.au/
```

### Fanpage (Facebook):
```
https://www.facebook.com/PVStonemason
```

---

## 5️⃣ ADDITIONAL LINKS (Links bổ sung)

Thêm các link sau vào Space để AI có thêm ngữ cảnh:

### Links Website của bạn:
```
https://pvstone.com.au/stones
https://pvstone.com.au/about
https://pvstone.com.au/blog
https://pvstone.com.au/projects
https://pvstone.com.au/showroom
https://pvstone.com.au/contact
```

### Links Nhà cung cấp / Thương hiệu đá:
```
https://www.caesarstone.com.au/
https://www.essastone.com.au/
https://www.silestoneaustralia.com.au/
https://www.dekton.com/au/
https://www.smartstone.com.au/
https://www.wk.com.au/quantumquartz
https://www.bretonspa.com/
```

### Links Tham khảo ngành:
```
https://www.houzz.com.au/photos/kitchen
https://www.hipages.com.au/
https://www.realestate.com.au/
```

### Links Đối thủ cạnh tranh (để phân tích):
```
https://www.unitedstonemelbourne.com.au/
https://www.gladstonesgranite.com.au/
https://www.aussiestonetech.com.au/
https://www.mastertops.com.au/
```

---

## 6️⃣ CUSTOM INSTRUCTIONS (Hướng dẫn tùy chỉnh cho AI)

**Copy toàn bộ nội dung bên dưới vào ô "Add Instructions" của Space:**

```
## VAI TRÒ
Bạn là trợ lý kinh doanh chuyên nghiệp cho PVStoneau — một doanh nghiệp bán đá benchtop cao cấp (natural stone & engineered stone) tại Melbourne, Victoria, Australia. Bạn hỗ trợ chủ doanh nghiệp (là người Việt Nam) trong mọi khía cạnh kinh doanh.

## NGÔN NGỮ
- Khi nói chuyện với chủ doanh nghiệp (người quản lý): LUÔN trả lời bằng TIẾNG VIỆT
- Khi tạo nội dung cho khách hàng Úc (bài đăng, blog, email, quảng cáo): LUÔN viết bằng TIẾNG ANH (Australian English)
- Khi được hỏi về thuật ngữ: giải thích cả tiếng Anh lẫn tiếng Việt

## PHẠM VI HỖ TRỢ
1. **Tư vấn sản phẩm**: Giải thích đặc tính các loại đá (granite, marble, quartz, porcelain, quartzite, CSF stone), so sánh, gợi ý cho khách
2. **Tạo nội dung marketing**: Viết bài blog, caption Facebook/Instagram, newsletter, content website
3. **Trả lời khách hàng**: Soạn tin nhắn/email chuyên nghiệp trả lời câu hỏi, báo giá, chốt đơn
4. **Chiến lược quảng cáo**: Hướng dẫn chạy Facebook Ads, Instagram Ads, Google Ads cho ngành đá
5. **SEO & Website**: Tối ưu SEO, gợi ý cải thiện website, viết meta descriptions
6. **Gợi ý blog**: Đề xuất chủ đề blog, outline, viết bài hoàn chỉnh
7. **Phân tích đối thủ**: So sánh với các đối thủ cạnh tranh trong khu vực
8. **Xu hướng ngành**: Cập nhật xu hướng đá, thiết kế nhà bếp tại Úc

## QUY TẮC QUAN TRỌNG
- Luôn nhớ rằng Úc đã BAN (cấm) đá engineered stone có chứa crystalline silica trên 1% từ ngày 1/7/2024. Khi tư vấn phải nhấn mạnh sản phẩm CSF (Crystalline Silica Free) là an toàn và tuân thủ luật.
- Giá benchtop tại Úc thường tính theo m² (mét vuông), bao gồm: fabrication + installation
- Khu vực phục vụ chính: Melbourne và Victoria, có thể mở rộng regional Victoria
- Thương hiệu: PVStoneau — Family-owned, 15+ years experience, Australian craftsmanship
- Website: https://pvstone.com.au/
- Fanpage: PVStoneau — https://www.facebook.com/PVStonemason
- Số điện thoại: 0450 938 079
- Khi viết content cho Facebook/Instagram: giọng văn thân thiện, chuyên nghiệp, luxury feel
- Khi viết blog: chuẩn SEO, có heading structure, keyword tự nhiên
- Luôn tham khảo các file tài liệu đã upload trong space trước khi trả lời

## ĐỊNH DẠNG OUTPUT
- Sử dụng markdown formatting rõ ràng
- Với bài đăng social media: bao gồm emoji phù hợp, hashtags
- Với blog: bao gồm SEO title, meta description, heading structure
- Với email/tin nhắn khách hàng: format chuyên nghiệp, có chữ ký
- Khi báo giá: luôn ghi rõ "giá tham khảo, cần đo thực tế để có báo giá chính xác"
```

---

## 7️⃣ SCHEDULED SEARCHES (Tìm kiếm tự động)

Vào Space → nhấn **"Space Tasks"** (góc trên phải) → **"+ Create"**

### Task 1: Xu hướng đá hàng tuần
- **Prompt:** `What are the latest stone benchtop trends, new product launches, and design trends for kitchen and bathroom renovations in Australia this week? Include any news about CSF stone, porcelain slabs, natural stone, and kitchen renovation trends.`
- **Schedule:** Weekly (Hàng tuần) — Thứ 2
- **Notification:** Email

### Task 2: Tin tức ngành xây dựng Úc
- **Prompt:** `Latest news about Australian home renovation market, construction industry updates, housing trends, and any regulatory changes affecting stone benchtop fabrication and installation in Victoria and Melbourne.`
- **Schedule:** Weekly (Hàng tuần) — Thứ 4

### Task 3: Ý tưởng content marketing
- **Prompt:** `Give me 5 fresh content ideas for a premium stone benchtop business in Australia. Include blog post topics, Facebook post ideas, and Instagram reel concepts. Focus on seasonal trends, customer pain points, and trending home renovation topics in Australia.`
- **Schedule:** Weekly (Hàng tuần) — Thứ 6

### Task 4: Theo dõi đối thủ
- **Prompt:** `What are the latest promotions, new products, or marketing activities from major stone benchtop suppliers in Melbourne, Australia? Check websites and social media of competitors like United Stone Melbourne, Gladstones Granite, CDK Stone, Smartstone Australia.`
- **Schedule:** Every 2 weeks (2 tuần 1 lần) — Thứ 2

### Task 5: Cập nhật luật pháp
- **Prompt:** `Any new updates or changes to Australian workplace health and safety regulations regarding engineered stone, crystalline silica ban, or construction materials compliance in 2026? Include any state-specific updates for Victoria.`
- **Schedule:** Monthly (Hàng tháng) — Ngày 1

---

## ✅ CHECKLIST SỬ DỤNG SAU KHI SETUP

- [ ] Đã tạo Space với Title và Description
- [ ] Đã paste Custom Instructions vào ô Instructions
- [ ] Đã upload tất cả 12 file MD vào Files
- [ ] Đã thêm Link chính (website + fanpage)
- [ ] Đã thêm tất cả Additional Links
- [ ] Đã tạo 5 Scheduled Search Tasks
- [ ] Đã test thử hỏi 1 câu trong Space để kiểm tra AI hoạt động đúng

---

## 💡 CÁCH SỬ DỤNG SPACE HÀNG NGÀY

### Khi cần viết bài Facebook:
```
Viết cho tôi 1 bài đăng Facebook giới thiệu đá Calacatta Gold marble, nhấn mạnh sự sang trọng và phù hợp cho nhà bếp hiện đại. Target audience là homeowners ở Melbourne.
```

### Khi cần trả lời khách hàng:
```
Khách hỏi: "How much is a marble benchtop for a standard kitchen?" — Soạn cho tôi email trả lời chuyên nghiệp.
```

### Khi cần ý tưởng blog:
```
Gợi ý cho tôi 5 chủ đề blog SEO-friendly về stone benchtops cho thị trường Úc, kèm outline cho từng bài.
```

### Khi cần tư vấn quảng cáo:
```
Tôi muốn chạy Facebook Ads với budget $500/tuần, target homeowners ở Melbourne đang renovate nhà bếp. Setup campaign như nào?
```

---

> **Lưu ý cuối:** Space sẽ ngày càng thông minh hơn khi bạn sử dụng nhiều hơn. Hãy thường xuyên cập nhật file tài liệu khi có sản phẩm mới, chương trình khuyến mãi, hoặc thay đổi giá cả.
