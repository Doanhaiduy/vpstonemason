# PROMT_OPTIMIZE

Bạn là AI Execution Lead cho repo stone-showroom-web.
Nhiệm vụ của bạn là PLAN + IMPLEMENT đầy đủ tất cả yêu cầu bên dưới, tự chạy đến khi xong, không làm nữa với mode "chỉ đề xuất".

## 0) Cách làm việc bắt buộc

- Tự suy luận và triển khai, không vẽ flowchart, không pseudo flow, không cần giải thích lý thuyết dài dòng.
- Ưu tiên hành động: đọc codebase, sửa file, cập nhật data, verify, báo cáo bằng kết quả thực tế.
- Nếu gặp blocker thật sự (thiếu quyền DB, API key, network bị chặn), nêu rõ blocker + đề xuất cách gỡ.
- Không được bỏ sót task nào.
- Không thay đổi phạm vi ngoài yêu cầu.

## 1) Mục tiêu tổng

Triển khai trọn bộ 3 nhóm công việc:

1. Nâng cấp hệ thống prompt/agent tạo content đá (ảnh + scene), bổ sung style-match prompt và mở rộng scene.
2. Tạo hệ thống AI script tạo video timelapse bằng AI (2 agent: stone-specialized + flexible-generalized), có image prompts từng công đoạn + video transition prompts từng cặp + caption viral FB/IG.
3. Sửa data website (range detail images, projects seed, home gallery mapping + CTA), cập nhật DB và verify đầy đủ.

## 2) Context cần bám sát

- Thương hiệu: PVStoneau, thị trường Melbourne (Australian English cho content đăng bài).
- Tồn tại các file/rule liên quan trong repo:
  - .github/instructions/stone-content-agent-rules.instructions.md
  - .github/agents/stone-content.agent.md
  - .github/agents/stone-swap.agent.md
  - .github/stone-content/content-log.json
  - docs/Luxury_Stone_Installation_Process.md
  - docs/PROMT_NEED_OPTIMIZE.MD
- Đã có workflow scene rotation và content log, cần mở rộng thông minh, không phá vỡ logic hiện tại.

## 3) Yêu cầu chi tiết theo task

### TASK 1 - Nâng cấp agent gen prompt đăng bài

Cần implement thật sự trong repo, không chỉ viết mô tả:

- Bổ sung 1 prompt mới để AI tạo ảnh theo "style giống ảnh tham chiếu user đính kèm".
- Prompt mới phải ép:
  - Giữ chất liệu đá đúng theo stone reference.
  - Học ngữ pháp ảnh (lighting, color mood, lens feeling, composition rhythm) từ style reference.
  - Không copy object theo kiểu sao chép máy móc; chỉ match style.
  - Vẫn photorealistic, không CGI, không artifact.
- Mở rộng scene catalog, thêm các bối cảnh mang tính thương mại/enterprise:
  - Company office interior
  - Elevator lobby / lift waiting area
  - Hotel reception / hotel lobby
  - Hotel bathroom / corridor feature wall
  - Các bối cảnh premium business khác hợp lý
- Đảm bảo scene mới được đưa vào logic rotation, tránh lặp cảnh quá gần.
- Không tạo ảnh có người trong frame nếu workflow hiện tại đang cấm người.
- Cập nhật template output/script mẫu nếu cần để user dùng ngay.

### TASK 2 - AI timelapse script system (nghiên cứu + triển khai)

#### 2.1 Nghiên cứu nhanh nhưng có giá trị thực chiến

- Tìm hiểu online các trick làm timelapse AI mượt và chân thật nhất hiện tại.
- Tổng hợp bộ công cụ/video model đang ổn nhất ở thời điểm hiện tại (ưu/nhược, use case phù hợp).
- Không lý thuyết chung chung; đưa khuyến nghị có thể áp dụng ngay cho workflow này.

#### 2.2 Tạo Agent A (Stone Timelapse Script)

Input:

- 1 ảnh bối cảnh thật (bếp, phòng tắm, ...)
- 1 ảnh mẫu đá
- Optional: tên/mã đá, mục tiêu bài đăng

Agent phải:

- Tự nhận diện vùng cần ốp đá, vùng giữ nguyên, điều kiện ánh sáng, màu sắc/vân đá.
- Bắt buộc có 2-3 người thi công nam người Úc xuất hiện xuyên suốt toàn bộ timeline (không đổi người giữa chừng).
- Trước khi sinh prompt, phải tạo "Worker Identity Lock" cho từng người (Worker A/B/C) gồm: khuôn mặt, màu da, kiểu tóc, râu/tóc mặt, chiều cao tương đối, form cơ thể, đồng phục/PPE, màu áo/quần, giày, găng tay, mũ bảo hộ.
- Mọi keyframe và transition phải giữ nguyên tuyệt đối Worker Identity Lock: không thay mặt, không thay quần áo, không đổi tỉ lệ cơ thể, không đổi số lượng người, không đổi màu PPE.
- Bám sát công đoạn lắp đặt đá theo docs/Luxury_Stone_Installation_Process.md.
- Sinh script image prompts theo từng mốc thi công:
  - Nếu 6 công đoạn thì tạo khoảng 10-12 keyframes (mỗi công đoạn 1-2 mốc).
  - Mỗi keyframe phải giữ nguyên bố cục ảnh gốc, chỉ thay đổi tiến trình thi công theo đúng giai đoạn.
  - Mỗi keyframe phải giữ liên tục vị trí logic của đội thi công (di chuyển hợp lý theo tiến trình, không teleport, không đổi vai trò bất thường).
  - Có time marker rõ ràng (vd: T01..T12).
- Sinh script video transition prompts theo từng cặp keyframe liên tiếp:
  - 10-12 keyframes -> 9-11 transition prompts.
  - Mỗi transition prompt để tạo clip 5-10 giây, ưu tiên mượt, liên tục, không giật.
  - Trong từng transition prompt phải khóa continuity cho con người: same faces, same outfits, same body size, same ethnicity cues, same PPE details.
- Sinh caption + hashtag cho Facebook + Instagram, hướng viral nhưng vẫn đúng brand context.

#### 2.3 Tạo Agent B (Flexible Timelapse Script)

- Rule thoáng hơn Agent A, không giới hạn trong bài toán đá.
- Input có thể là 1 ảnh + 1 objective tự do, vd: "xây sân bóng đá lớn nhất VN tại đây".
- Vẫn phải output theo cùng khung chất lượng:
  - Multi-stage keyframes
  - Transition prompts từng cặp
  - Logic không gian giữ nguyên camera/perspective hợp lý
  - Caption + hashtag theo nền tảng social
- Nếu objective có bối cảnh thi công/xây dựng, bắt buộc áp dụng nhân sự cố định giống Agent A: 2-3 nhân sự chính, khóa danh tính/đồng phục/tỉ lệ cơ thể xuyên suốt timeline.
- Phải đủ mạnh để dùng cho các bài toán transform/construct khác nhau.

#### 2.4 Chất lượng output của cả 2 agent

- Prompt image/video viết bằng English để ném vào tool gen.
- Mô tả rõ camera movement, lighting continuity, material continuity, occlusion consistency.
- Có negative constraints để tránh artifact (flicker, morph sai, geometry drift, object pop-in/out).
- Có negative constraints riêng cho con người: no face swap, no wardrobe change, no body scale drift, no extra/missing workers, no identity morph.
- Có negative constraints riêng cho bối cảnh: không đổi layout, không đổi camera FOV bất thường, không đổi thời tiết/ánh sáng đột ngột nếu không có trong kịch bản.
- Có checklist verify trước khi user đem đi render hàng loạt.

### TASK 3 - Sửa data website + DB (làm thật)

#### 3.1 Range detail images bị lặp

- Audit toàn bộ range detail pages, tìm các range đang bị trùng image:
  - Main hero image trên cùng
  - Sub/content image bên dưới
  - Item image
- Quy tắc bắt buộc:
  - Main và sub KHÔNG được trùng item image.
  - Main và sub nên khác nhau và đúng context của range.
- Tìm image phù hợp trên web cho từng range, ưu tiên nguồn chất lượng và phong cách đúng sản phẩm.
- Cập nhật lại link image trong DB cho tất cả range bị lỗi.
- Verify không sót range nào.

#### 3.2 Project data đang fake

- Thay/seed lại project data theo hướng thật hơn, đủ thông tin, văn phong tự nhiên.
- Mỗi project phải map tới stone có thật trong product catalog.
- Nội dung project đủ dài, logic, tạo cảm giác dự án thật (không văn mẫu máy móc).
- Ảnh project phải phản ánh đúng mẫu đá đang liệt kê.
- Nếu cần, tạo/đổi seed script để import data ổn định, có thể chạy lại an toàn.

#### 3.3 Home - Stone Collection Gallery mapping sai

- Sửa mapping tên đá, image không khớp, và thứ tự nếu cần.
- Đảm bảo mỗi card map đúng tới stone tồn tại trong products.
- Thêm CTA button để nhảy trực tiếp vào đúng product đá đó.
- CTA phải dễ thấy hơn "view colour" hiện tại (dễ nhìn, dễ click trên mobile + desktop).

## 4) Tiêu chuẩn nghiệm thu bắt buộc

- Không còn range nào trùng image theo quy tắc task 3.1.
- Project seed data mới map đúng stone catalog, text và image hợp lý.
- Home gallery đã map đúng tên + ảnh + link đến đúng product, CTA dễ thấy.
- 2 agent timelapse mới đã tồn tại trong repo, có hướng dẫn sử dụng + output template rõ.
- Script timelapse luôn giữ ổn định 2-3 thợ thi công nam người Úc xuyên suốt (mặt, quần áo, vóc dáng, PPE, số lượng).
- Agent content đã có style-match prompt và bộ scene mở rộng như yêu cầu.
- Mọi thay đổi đã được test/verify ở mức hợp lý (lint/build/check script hoặc truy vấn check data), có bằng chứng.

## 5) Định dạng kết quả AI phải trả

Chỉ trả kết quả thực thi, ngắn gọn, đúng trọng tâm:

1. Danh sách file đã tạo/sửa.
2. Danh sách task hoàn thành theo 1/2/3.
3. Kết quả verify (passed/failed + lý do nếu fail).
4. Hướng dẫn chạy nhanh cho user để dùng ngay (nếu có).

Không trả về flowchart, không kể lý thuyết dài, không bỏ sót task.
