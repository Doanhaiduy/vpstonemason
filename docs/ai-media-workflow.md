# AI Workflow tạo Ảnh & Video từ 1 Mẫu Đá

_Cho VPStoneMason & Co. – dùng Meta AI + Auto Meta + Google Flow để tạo nội dung Facebook/Instagram từ 1 hình đá và mô tả._

> **⚠️ LƯU Ý (04/2026):** Google Whisk đã ngừng hoạt động và được thay thế bằng **Google Flow** (tích hợp Imagen 4 + Veo 3). Tài liệu này đã được cập nhật để phản ánh thay đổi này.

---

## 1. Tổng quan 3 công cụ

### 1.1 Meta AI (meta.ai)

- Meta AI là trợ lý AI miễn phí của Meta, tích hợp trong **web meta.ai, Messenger, WhatsApp, Instagram**.[web:68][web:78]
- Bạn có thể gõ prompt hoặc dùng lệnh **/imagine** để tạo ảnh từ mô tả text, Meta AI sẽ sinh **4 phiên bản ảnh** cho mỗi prompt để bạn chọn, refine hoặc tải xuống.[web:68][web:71][web:73]
- Giao diện mới cho phép chọn thêm **mood, lighting, style** để tinh chỉnh ảnh sau khi gen, mà không cần viết lại prompt từ đầu.[web:73]
- Meta AI cũng hỗ trợ **tạo video ngắn** từ prompt; nhiều hướng dẫn thực tế cho thấy đây là lựa chọn miễn phí để tạo video cho social post.[web:70][web:75]

### 1.2 Auto Meta Automator (Chrome Extension)

- **Meta Automator – Auto Meta Bulk AI Image & Video Generator** là extension Chrome giúp **tự động hóa Meta AI**, đặc biệt là **gen ảnh và video hàng loạt**.[web:72]
- Tính năng chính:
  - Tạo **danh sách prompt (prompt list)**, chạy theo hàng đợi (queue) để gen nội dung **bulk**.
  - Hỗ trợ **cả image và video tasks** trong cùng workflow.[web:72][web:70]
  - Cho phép **tải ảnh/video về nhanh, nhiều file** thông qua automation (không cần click từng cái).[web:72][web:77]
  - Có **built-in prompt generator** để gợi ý prompt trực tiếp trong extension.[web:72]
- Không cần API key, không cấu hình phức tạp; cài vào Chrome, bấm icon extension, nó đưa bạn thẳng tới Meta AI và chèn UI automation bên trên.[web:72][web:74]

### 1.3 Google Flow (thay thế Whisk)

- **Google Flow** là tool kế thừa Google Whisk, tích hợp **Imagen 4** (gen ảnh) và **Veo 3** (gen video).
- Truy cập tại [flow.google.com](https://labs.google/fx/tools/flow) → đăng nhập Google account.
- Tính năng chính:
  - Upload **ảnh tham chiếu (reference image)** để AI hiểu màu sắc, vân đá, chất liệu – tương tự Subject/Scene/Style của Whisk cũ.
  - Gen ảnh chất lượng cao với nhiều **aspect ratio** (1:1, 4:5, 9:16).
  - **Refine/Edit** ảnh đã gen bằng prompt ngắn (đổi ánh sáng, thêm decor, đổi góc).
  - **Animate** ảnh thành video ngắn bằng Veo 3 (camera pan, push-in, zoom).
  - Hỗ trợ **character consistency** và **scene creation** nâng cao hơn Whisk.

---

## 2. Nguyên tắc chung cho ngành đá benchtop

Áp dụng chung cho cả Meta AI và Whisk khi gen ảnh/video từ 1 hình slab đá:

- Luôn **upload ảnh mẫu đá gốc** (slab hoặc sample) làm reference, sau đó mô tả chi tiết bằng text để AI hiểu màu & vân.
- Với nội dung cho thị trường Úc, nên thêm các cụm: _"modern Australian kitchen", "Melbourne home", "stone benchtop", "CSF compliant"_ để phù hợp bối cảnh và luật CSF.[file:11]
- Nhấn mạnh các yếu tố:
  - **Loại đá**: granite, marble, porcelain, CSF stone…[file:11]
  - **Màu nền + vân**: "warm white with soft grey veining", "light grey with fine white veining"…[file:11]
  - **Finish**: polished, honed, matt.[file:11]
  - **Độ dày & kiểu cạnh**: 20–30mm, pencil round, mitred waterfall.[file:11]
- Luôn yêu cầu: **"photorealistic", "real project photo, not CGI, not showroom render"** để ảnh trông thật, hợp với khách Úc.

---

## 3. Workflow đề xuất: từ 1 hình đá → bộ ảnh + video cho 1 mẫu

### Bước 1 – Chuẩn hoá mô tả đá (Stone Description)

Tạo 1 template mô tả cho mỗi stone code, ví dụ cho **AC Stone AC0806N**:

> "AC Stone AC0806N is a light grey engineered stone with fine white veining, polished finish, 20–30 mm thickness, CSF compliant, ideal for modern Melbourne kitchen benchtops."

Lưu mô tả này để dùng chung cho cả Meta AI, Auto Meta và Whisk.

### Bước 2 – Dùng Google Flow để tạo bộ ảnh chất lượng cao

1. Vào **[flow.google.com](https://labs.google/fx/tools/flow)** và đăng nhập Google account.
2. Click **"New Project"** hoặc **"Create"** để bắt đầu.
3. **Upload reference image**: Tìm nút **"Add Reference"** → upload ảnh slab/sample đá. Google Flow dùng Gemini để phân tích màu sắc, vân, và chất liệu đá từ ảnh.
4. **Chọn output type**: Image → chọn **aspect ratio**:
   - **1:1** (1080×1080) cho Facebook Feed
   - **4:5** (1080×1350) cho Feed tối ưu engagement
   - **9:16** (1080×1920) cho Stories/Reels
5. Nhập prompt vào ô prompt, dùng các prompt mẫu bên dưới:

**Hero kitchen photo (1 ảnh, không ghép):**

```text
Create ONE SINGLE photorealistic kitchen photo (not a collage, not split-screen, not side-by-side).

Use the uploaded stone sample as the exact benchtop material.
The stone is [[STONE_NAME]]: [[STONE_DESCRIPTION]].
Keep the colour, veining and polished finish identical to the reference stone.

Show a modern Australian kitchen in a Melbourne home, with this stone installed on the island and main benchtop.
Clean white and light-wood cabinetry, gas cooktop, oven, sink cut-out, realistic edge profile and thickness, natural daylight from a large window, a few decor items (cookbook, plant, coffee cup) on the bench.

Ultra-realistic interior photography, natural light, subtle imperfections, looks like a real project photo taken by a stonemason company.
Square 1:1 composition, one single scene only.
```

6. Click **"Generate"** → chờ 10-30 giây → xem kết quả.
7. Lặp lại với các prompt chuyên biệt khác (installation, workshop, close-up) để có 4–6 ảnh khác nhau:
   - **Thi công tại nhà**: 2 thợ đang lắp benchtop, clamp, băng keo xanh, dust extraction.
   - **Xưởng gia công**: slab đang được cắt/polish, máy móc, nước, bụi.
   - **Close-up**: chụp chi tiết mép đá với decor (ly café, plan, chopping board).
8. Dùng nút **"Refine"** hoặc **"Edit"** của Google Flow nếu cần chỉnh nhẹ (tăng sáng, thêm stool, đổi loại tap…).
9. **Download**: Click **"Download"** / **"Export"** → chọn PNG/JPG chất lượng cao.

Kết quả: 1 bộ ảnh rất thật, thống nhất style, dùng làm **ảnh gốc** cho mọi post/ads.

### Bước 3 – Dùng Meta AI + Auto Meta để nhân bản ảnh & tạo biến thể

#### 3.1 Tạo ảnh đơn lẻ với Meta AI

1. Truy cập **meta.ai** và đăng nhập bằng tài khoản Facebook/Instagram.[web:71][web:75]
2. Gõ prompt hoặc dùng lệnh **/imagine** để tạo ảnh theo text; mỗi lần Meta AI sẽ sinh **4 phiên bản ảnh**.[web:68][web:71][web:73]
3. Bạn có thể chọn style (realistic, cinematic...), mood và lighting trong giao diện để tinh chỉnh.[web:73]
4. Tải ảnh xuống dùng cho social post.

**Prompt mẫu cho Meta AI (hero kitchen):**

```text
/imagine A photorealistic modern Australian kitchen in a Melbourne home, featuring [[STONE_NAME]] stone benchtops: [[STONE_DESCRIPTION]].
Bright natural daylight, white and light-wood cabinetry, gas cooktop, stainless steel appliances, timber floor, a styled island with cookbook, coffee cup and a small plant.
Real project photo, not CGI, realistic shadows and reflections, social media ready.
```

Bạn có thể copy prompt này vào **Auto Meta** làm 1 trong nhiều prompt trong danh sách.

#### 3.2 Bulk content với Auto Meta Automator

1. Cài extension **Meta Automator – Auto Meta Bulk AI Image & Video Generator** từ Chrome Web Store.[web:72][web:74]
2. Bấm icon extension → chọn **Go to Meta AI**; extension sẽ overlay giao diện quản lý prompt và queue lên meta.ai.[web:72][web:74]
3. Tạo **prompt list** cho 1 mẫu đá, ví dụ:
   - Prompt 1: Hero kitchen image.
   - Prompt 2: Close-up benchtop with coffee.
   - Prompt 3: Installation scene with workers.
   - Prompt 4: Workshop/fabrication scene.
4. Trong Auto Meta:
   - Thêm từng prompt vào **queue**.
   - Chọn loại nhiệm vụ: image hoặc video cho từng prompt.[web:72]
   - Chạy **bulk generation** – extension sẽ lần lượt gửi prompt tới Meta AI và chờ kết quả.[web:70][web:72]
5. Dùng tính năng **download nhanh/bulk download** của extension để tải toàn bộ ảnh/video về máy (không phải click từng file).[web:72][web:77]

Kết quả: chỉ cần set 1 lần, bạn có **4–8 ảnh / video** khác nhau cho cùng 1 mẫu đá, sẵn sàng dùng cho nhiều post.

### Bước 4 – Tạo video ngắn (installation / before–after)

#### 4.1 Video bằng Meta AI + Auto Meta

- Nhiều hướng dẫn cho thấy Meta AI có thể tạo **video clip ngắn** (construction, process, cinematic shot…) từ prompt, và Auto Meta có thể xếp hàng và chạy bulk các video này.[web:70][web:72]
- Workflow gợi ý cho 1 mẫu đá:
  1. Trong Auto Meta, tạo 2–3 video prompts, ví dụ:

```text
A 6-second hyper-realistic video of a kitchen renovation timelapse in a Melbourne home, showing old laminate benchtops being replaced with [[STONE_NAME]] stone benchtops: [[STONE_DESCRIPTION]].
Camera slowly moves around the island, installation process, tools and workers visible, ending on a clean finished kitchen shot.
```

```text
A 5-second cinematic video shot of a finished modern kitchen in Melbourne with [[STONE_NAME]] stone benchtops, slow camera pan across the island, sunlight from the window, subtle depth of field, perfect for social media ad background.
```

  2. Chọn task type = **Video** trong Auto Meta cho các prompt này.
  3. Chạy queue → tải video xuống bằng nút download của Auto Meta.[web:70][web:72]

Video dùng làm:
- Background cho Reels (overlay text và logo VPStoneMason).
- B-roll trong video dài (khi bạn quay thêm voiceover). 

#### 4.2 Video bằng Google Flow Animate (Veo 3)

- Google Flow cho phép bạn **animate ảnh** sang video bằng **Veo 3**; upload ảnh đã gen hoặc ảnh thi công thật, rồi mô tả chuyển động camera.
- Workflow đơn giản:
  1. Chọn 1 hero image đã gen ở Bước 2 hoặc ảnh thực tế.
  2. Trong **Google Flow** ([flow.google.com](https://labs.google/fx/tools/flow)), chọn chế độ **"Animate"** hoặc **"Create Video"**.
  3. Upload ảnh làm frame khởi đầu → nhập prompt:

```text
Smooth 5-second camera push-in shot towards the stone kitchen island, emphasizing the [[STONE_NAME]] benchtop texture and veining, soft natural daylight, shallow depth of field, cinematic but realistic. Stable camera, no sudden movements.
```

  4. Click **"Generate"** → chờ render (1-2 phút) → **Download** video.
  5. Dùng cho Reels/Stories (có thể thêm text và nhạc trong Instagram/CapCut).

---

## 5. Best practices & mẹo cho case bán đá

### 5.1 Về phong cách hình ảnh

- Luôn yêu cầu **"photorealistic", "real project photo", "Australian home", "Melbourne kitchen"** để tránh nhìn quá "AI art".
- Hạn chế từ ngữ kiểu "hyper-detailed 8K, ultra CGI" nếu bạn muốn hình giống ảnh chụp thật.
- Thêm chi tiết đời sống: fruit bowl, chopping board, cookbook, coffee cup, tea towel… để ảnh ít bị "showroom".

### 5.2 Về tính nhất quán giữa các ảnh

- Dùng cùng một bộ mô tả stone (`[[STONE_DESCRIPTION]]`) cho tất cả prompt trên Meta AI, Auto Meta và Whisk.
- Với Google Flow, sử dụng **cùng 1 reference image** cho nhiều lần gen (ví dụ 1 ảnh kitchen yêu thích), để màu ánh sáng & layout tương đồng.
- Khi dùng Meta AI, ưu tiên chọn lại cùng **mood / lighting preset** cho các ảnh của 1 mẫu đá.[web:73]

### 5.3 Về pipeline thực tế cho VPStoneMason

_Cho mỗi mẫu đá mới:_

1. **Chuẩn bị:**
   - Ảnh slab mẫu đá (từ supplier hoặc tự chụp).
   - Mô tả stone theo template (loại đá, màu, vân, finish, độ dày, CSF…).[file:11]

2. **Google Flow – ảnh gốc chất lượng:**
   - Gen 3–4 ảnh: hero kitchen, installation, workshop, close-up.

3. **Meta AI + Auto Meta – nhân bản & video:**
   - Tạo prompt list 4–6 biến thể (angle khác, decor khác, time-of-day khác).
   - Chạy bulk image + video để có nhiều option cho 2–4 tuần đăng bài về mẫu đá đó.[web:70][web:72]

4. **Chọn & gắn vào nội dung marketing:**
   - Feed post: dùng hero + close-up.
   - Reels/Stories: dùng video timelapse/animate + overlay text ("Free Quote", "CSF Stone", "Melbourne Installation").[file:7]

5. **Tối ưu dần:**
   - Nhìn lại ảnh/video nào có CTR, engagement tốt trong ads để định hướng prompt cho các mẫu đá tiếp theo.[file:7]

---

## 6. Gợi ý cấu trúc thư mục lưu trữ nội bộ

Để bạn dễ quản lý asset AI cho từng stone code:

```text
/AI-Media
  /AC0806N
    /images-meta
    /images-flow
    /videos-meta
    /videos-flow
    /prompts.txt
    /caption.txt
  /Dekton-Entzo
    /images-meta
    /images-flow
    /videos-meta
    /videos-flow
    /prompts.txt
    /caption.txt
```

Mỗi thư mục nên có 1 file `prompts.txt` ghi lại các prompt đã dùng thành công, để tái sử dụng và chỉnh nhẹ cho những mẫu mới.
