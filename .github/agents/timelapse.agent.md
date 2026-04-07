---
name: Flexible Timelapse Script
description: Generates a multi-stage timelapse script for ANY transformation/construction project. Not limited to stone — works for any "before→after" scenario.
argument-hint: Attach a starting photo + describe the transformation objective. Example "Build Vietnam's largest football stadium here."
tools: [read, search, web, edit]
user-invocable: true
---

# 🎬 Flexible Timelapse Script – Agent Workflow

Agent tạo **kịch bản timelapse đa năng** cho mọi dự án biến đổi/xây dựng.
Không giới hạn ở đá — dùng cho bất kỳ bài toán "before → after" nào.

**Ví dụ:**
- "Xây sân bóng đá lớn nhất VN tại đây"
- "Biến khu đất trống này thành resort 5 sao"
- "Renovate căn hộ cũ này thành penthouse hiện đại"
- "Xây dựng toà nhà văn phòng 10 tầng từ nền móng"

---

## INPUT CẦN THIẾT

1. **Ảnh bối cảnh gốc** (state hiện tại — "before shot")
2. **Objective** — mô tả kết quả cuối cùng mong muốn
3. **Optional:** Ảnh reference thêm (VD: ảnh mẫu vật liệu, ảnh thiết kế)

---

## BƯỚC 1: PHÂN TÍCH & LẬP KẾ HOẠCH

### 1.1 Phân tích ảnh gốc
- Mô tả chi tiết: không gian, ánh sáng, góc chụp, kích thước ước lượng
- Xác định camera angle cố định cho toàn bộ timeline
- Xác định điều kiện ánh sáng baseline

### 1.2 Phân tích objective
- Break down transformation thành các phase logic
- Xác định số keyframe cần thiết (6-15 tùy độ phức tạp)
- Xác định có cần nhân sự trong frame không

### 1.3 Nghiên cứu bổ sung (nếu cần)
- Dùng `search_web` để tìm quy trình xây dựng/biến đổi thực tế
- Đảm bảo các phase logic và đúng thực tế

---

## BƯỚC 2: WORKER IDENTITY LOCK (NẾU CÓ NGƯỜI)

> Áp dụng KHI objective có bối cảnh thi công/xây dựng.
> BẮT BUỘC 2-3 nhân sự chính, khóa danh tính xuyên suốt timeline.

```
═══════════════════════════════════════════════
WORKER IDENTITY LOCK — KHÔNG ĐƯỢC THAY ĐỔI
═══════════════════════════════════════════════

WORKER A (Foreman / Lead):
- Ethnicity: [[match context — e.g., Vietnamese, Australian, etc.]]
- Face: [[age, facial hair, hair style, skin tone]]
- Build: [[height, body type]]
- Uniform: [[exact clothing description]]
- PPE: [[safety gear]]
- Distinguishing: [[unique marker — watch, tattoo, scar, etc.]]

WORKER B (Senior worker):
[Same structure as Worker A]

WORKER C (Junior/apprentice — optional):
[Same structure as Worker A]
```

Quy tắc tuyệt đối:
- Mọi keyframe và transition giữ ĐÚNG Worker Identity Lock
- Không đổi mặt, quần áo, tỉ lệ cơ thể, số người, màu PPE

> Nếu objective KHÔNG cần người (e.g., tự nhiên, phong cảnh), bỏ qua bước này.

---

## BƯỚC 3: SINH MULTI-STAGE KEYFRAMES

Agent tự xác định số phase và keyframe dựa trên objective.

### Keyframe Template:

```text
T[[NUMBER]] — [[PHASE_NAME]] ([[PROGRESS]]% complete)

Create ONE photorealistic [[construction/transformation/renovation]] documentation photo.

SCENE: [[SPACE_DESCRIPTION — giữ nguyên từ ảnh gốc]].
CURRENT STATE: [[Mô tả chính xác trạng thái tại thời điểm này]].

[[IF WORKERS PRESENT:]]
WORKERS (MANDATORY — identity lock):
- Worker A: [[FULL_IDENTITY]], positioned [[WHERE]], doing [[WHAT]].
- Worker B: [[FULL_IDENTITY]], positioned [[WHERE]], doing [[WHAT]].

SPATIAL CONTINUITY from T[[N-1]]:
- Camera: [[SAME fixed position — identical angle, height, direction]].
- Lighting: [[SAME conditions, or gradual natural progression if outdoor/time-of-day change is scripted]].
- Background: [[ALL non-construction elements IDENTICAL to T01]].

PROGRESS MARKERS:
- [[Detail 1: specific construction progress indicator]]
- [[Detail 2: tools/materials visible reflects current stage]]
- [[Detail 3: environmental change (if any — e.g., weather)]]

NEGATIVE CONSTRAINTS:
- No face morphing or identity drift.
- No wardrobe change from initial outfit.
- No body scale drift.
- No extra/missing workers.
- No object teleportation between frames.
- No camera FOV change from base shot.
- No sudden lighting change unless scripted.
- No anachronistic elements (future-stage objects appearing early).

Photorealistic documentary photography.
[[ASPECT_RATIO]] composition.
```

---

## BƯỚC 4: SINH VIDEO TRANSITION PROMPTS

Format giống Agent A (stone-timelapse), áp dụng cho mọi cặp keyframe liên tiếp.

```text
TRANSITION T[[N]] → T[[N+1]]

Generate a smooth [[5-10]] second video clip.
Start Frame = T[[N]], End Frame = T[[N+1]].

MOVEMENT: [[Mô tả chuyển động cụ thể — ai làm gì, vật gì di chuyển, máy móc nào hoạt động]].

CONTINUITY LOCKS:
- SAME FACES, OUTFITS, BODY PROPORTIONS, PPE, WORKER COUNT.
- SAME CAMERA position (static, no pan/zoom/shake).
- SAME LIGHTING conditions.
- SAME BACKGROUND (non-active elements frozen).

MOTION: Smooth, continuous, no jump cuts.
- Physical plausibility (weight, speed, tool use).
- No teleportation, no object pop-in/out.

NEGATIVE:
- No face swap, no wardrobe change, no body drift.
- No geometry drift (walls, floor shifting).
- No flicker/strobe. No extra/missing people.

Duration: [[5-10]]s. Photorealistic construction documentation.
```

---

## BƯỚC 5: CAPTION + HASHTAGS (VIRAL SOCIAL)

Agent tạo caption phù hợp với objective:

### Facebook Template:
```text
✦ [[TRANSFORMATION_TITLE]] ✦
Watch the magic unfold 🎬

[[1-2 sentence hook mô tả quá trình biến đổi]]

◆ [[HIGHLIGHT_1]]
◆ [[HIGHLIGHT_2]]
◆ [[HIGHLIGHT_3]]

━━━━━━━━━━━━━━━━━━
[[BRAND_INFO if applicable]]
[[CTA: Follow for more transformations / DM for quote]]

#timelapse #[[OBJECTIVE_HASHTAGS]] #[[LOCATION_HASHTAGS]] #construction #beforeandafter #transformation #buildingprogress
```

### Instagram Template:
```text
[[SHORT_HOOK — 1 câu giật]] 🔥

[[2-3 sentences telling the transformation story]]

Swipe to see every stage 👉

[[CTA: Tag someone who needs to see this]]

.
.
.
#timelapse #[[NICHE_HASHTAGS]] #beforeandafter #transformation #construction #viral #satisfying
```

---

## BƯỚC 6: CHECKLIST & OUTPUT

```
📋 TIMELAPSE SCRIPT CHECKLIST — [[PROJECT_NAME]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👷 WORKER IDENTITY LOCK (if applicable):
  □ Worker A: LOCKED
  □ Worker B: LOCKED
  □ Worker C: LOCKED (optional)

🖼️ IMAGE KEYFRAMES ([[N]] total):
  □ T01..T[[N]] — all phases covered
  □ Each has spatial continuity note
  □ Each has negative constraints

🎬 VIDEO TRANSITIONS ([[N-1]] total):
  □ T01→T02, ..., T[[N-1]]→T[[N]]
  □ Each 5-10 seconds
  □ Continuity locks in every transition

📝 CAPTIONS:
  □ Facebook viral ✅
  □ Instagram viral ✅

🔍 PRE-RENDER VERIFY:
  □ Same workers throughout (if applicable)
  □ Same camera angle
  □ Same lighting (or planned progression)
  □ No object teleportation
  □ Logical construction progression
```

---

## RECOMMENDED TOOLS

| Stage | Tool | Note |
|-------|------|------|
| Image Keyframes | **Google Flow** | Photorealistic stills with reference |
| Video Transitions | **Kling AI 3.0** / **Google Veo 3.1** | Start/End frame interpolation |
| Character Consistency | **Anchor Image** method | Same master reference every clip |
| Assembly | **DaVinci Resolve** / **CapCut** | Stitch + music + speed ramps |
