---
name: Stone Timelapse Script
description: Generates a multi-stage timelapse script for stone installation projects. Produces image keyframes, video transitions, worker identity locks, and viral social media captions.
argument-hint: Attach (1) a space photo and (2) a stone sample image. Optionally provide stone name/code and post objective.
tools: [read, search, web, edit]
user-invocable: true
---

# 🎬 Stone Timelapse Script – Agent Workflow

Agent tạo **kịch bản timelapse hoàn chỉnh** cho quá trình lắp đặt đá, bám sát `docs/Luxury_Stone_Installation_Process.md`.

**Output bao gồm:**
- Worker Identity Lock (2-3 thợ Úc cố định xuyên suốt)
- 10-12 image keyframes (T01..T12)
- 9-11 video transition prompts (mỗi cặp keyframe liên tiếp)
- Facebook + Instagram caption viral

---

## INPUT CẦN THIẾT

1. **Ảnh bối cảnh thật** (bếp, phòng tắm, v.v.)
2. **Ảnh mẫu đá** (slab sample)
3. **Optional:** Tên/mã đá, mục tiêu bài đăng (default/ads)

---

## BƯỚC 1: PHÂN TÍCH INPUT

### 1.1 Phân tích ảnh bối cảnh
- Xác định chính xác vùng cần ốp đá (benchtop, splashback, vanity, v.v.)
- Vùng giữ nguyên (tủ, sàn, tường, thiết bị)
- Điều kiện ánh sáng (nguồn sáng, hướng, thời gian trong ngày)
- Kích thước không gian ước lượng, góc chụp

### 1.2 Phân tích mẫu đá
- Dùng `search_web` tìm thông tin nhà sản xuất (mã AC gốc)
- Mô tả: màu nền, vân (veining), finish, đặc tính đặc biệt
- Tạo `STONE_DESCRIPTION` chuẩn

---

## BƯỚC 2: WORKER IDENTITY LOCK (BẮT BUỘC)

Agent PHẢI tạo profile cố định cho 2-3 thợ thi công **nam người Úc** TRƯỚC KHI sinh bất kỳ prompt nào.

```
═══════════════════════════════════════════════
WORKER IDENTITY LOCK — KHÔNG ĐƯỢC THAY ĐỔI
═══════════════════════════════════════════════

WORKER A (Lead Installer):
- Ethnicity: Australian Caucasian
- Face: [[VD: mid-30s, clean-shaven, square jawline, short brown hair]]
- Build: [[VD: athletic, 180cm, broad shoulders]]
- Uniform: [[VD: navy blue polo shirt with company logo on left chest, khaki work pants, tan leather steel-cap boots]]
- PPE: [[VD: clear safety glasses pushed up on forehead, blue nitrile gloves]]
- Distinguishing: [[VD: silver wristwatch on left wrist]]

WORKER B (Assistant Installer):
- Ethnicity: Australian Caucasian
- Face: [[VD: early 40s, short grey-streaked beard, crew cut dark hair]]
- Build: [[VD: stocky, 175cm, muscular forearms]]
- Uniform: [[VD: grey work t-shirt, navy cargo pants, black work boots]]
- PPE: [[VD: yellow hi-vis vest, black rubber gloves, safety glasses on]]
- Distinguishing: [[VD: visible tattoo sleeve on right arm]]

WORKER C (Optional — Apprentice):
- Ethnicity: [[VD: Australian of Mediterranean descent]]
- Face: [[VD: early 20s, clean-shaven, curly dark hair]]
- Build: [[VD: lean, 178cm]]
- Uniform: [[VD: same navy polo as Worker A, dark jeans, new-looking boots]]
- PPE: [[VD: white hard hat, clear safety glasses, blue nitrile gloves]]
- Distinguishing: [[VD: wearing a toolbelt]]
```

> **QUY TẮC TUYỆT ĐỐI:** Mọi keyframe và transition PHẢI giữ ĐÚNG Worker Identity Lock.
> Không đổi mặt, không đổi quần áo, không đổi tỉ lệ cơ thể, không đổi số lượng người, không đổi màu PPE.

---

## BƯỚC 3: SINH IMAGE KEYFRAMES (T01→T12)

Bám sát 6 giai đoạn trong `docs/Luxury_Stone_Installation_Process.md`:

| Stage | Giai đoạn | Keyframes | Mô tả |
|-------|-----------|-----------|-------|
| 1 | Material Handling & Site Access | T01, T02 | T01: Site protection setup (floors covered, corner guards). T02: Slab being trolleyed in on A-frame |
| 2 | Site Checking & Dry-Fitting | T03, T04 | T03: Spirit level on cabinets, dry-fit check. T04: Slab placed on cabinets, gap checking |
| 3 | Material Preparation | T05 | T05: Mixing/colour-matching epoxy resin, silicone tubes laid out |
| 4 | Installation & Joining | T06, T07, T08 | T06: Applying silicone wave pattern. T07: Lowering slab into position. T08: Seam setter clamping joints |
| 5 | Finishing & Cleaning | T09, T10 | T09: Scraping excess epoxy, cleaning with acetone. T10: Polishing surface, final clean-up |
| 6 | Handover & Reveal | T11, T12 | T11: Final inspection close-up (pristine benchtop). T12: Wide shot of completed space, styled with coffee cup/flowers |

### Keyframe Image Prompt Format:

```text
T[[NUMBER]] — [[STAGE_NAME]]

Create ONE photorealistic construction documentation photo.

SCENE: [[EXACT_SPACE_DESCRIPTION from Step 1 analysis]].
STONE: [[STONE_NAME]] — [[STONE_DESCRIPTION]]. Use the attached stone reference for exact colour and veining.
STAGE: [[WHAT_IS_HAPPENING at this specific moment]].

WORKERS PRESENT (MANDATORY — use attached worker reference or follow identity lock EXACTLY):
- Worker A: [[FULL_IDENTITY_DESCRIPTION]], positioned [[WHERE/DOING_WHAT]].
- Worker B: [[FULL_IDENTITY_DESCRIPTION]], positioned [[WHERE/DOING_WHAT]].
[[- Worker C if applicable]]

SPATIAL CONTINUITY from previous keyframe T[[N-1]]:
- Camera angle: [[SAME as T01 base shot — eye level, 1.5m height, from [[direction]]]].
- Lighting: [[SAME natural daylight from [[window direction]], supplemented by overhead work lights]].
- Background: [[ALL non-stone elements IDENTICAL to T01]].

PROGRESS MARKERS VISIBLE:
- [[Detail 1: e.g., "5 of 8 protective floor mats still in place"]]
- [[Detail 2: e.g., "silicone gun resting on rear benchtop section"]]
- [[Detail 3: e.g., "A-frame trolley visible in background with remaining slab"]]

NEGATIVE CONSTRAINTS:
- No face morphing or identity drift from worker descriptions above.
- No wardrobe change from initial outfit.
- No body scale drift (Worker A must remain taller than Worker B).
- No extra or missing workers (exactly [[2 or 3]] people in frame).
- No furniture teleportation or object pop-in/pop-out compared to previous frame.
- No camera FOV change from base shot.
- No sudden lighting/weather change.

Photorealistic construction site photography, documentary style.
[[ASPECT_RATIO]] composition.
```

---

## BƯỚC 4: SINH VIDEO TRANSITION PROMPTS

Mỗi cặp keyframe liên tiếp (T01→T02, T02→T03, ...) = 1 transition prompt.

### Transition Prompt Format:

```text
TRANSITION T[[N]] → T[[N+1]] — [[STAGE_DESCRIPTION]]

Generate a smooth 5-8 second video clip transitioning between the two attached reference frames (Start Frame = T[[N]], End Frame = T[[N+1]]).

MOVEMENT DESCRIPTION:
[[VD: "Worker A lifts the spirit level from the cabinet surface and steps aside. Worker B moves forward with the slab trolley. Camera remains static at eye level throughout."]]

CONTINUITY LOCKS (MANDATORY):
- SAME FACES: Worker A = [[brief face description]], Worker B = [[brief face description]].
- SAME OUTFITS: Worker A in [[outfit]], Worker B in [[outfit]].
- SAME BODY PROPORTIONS: Worker A 180cm athletic, Worker B 175cm stocky.
- SAME PPE: [[exact PPE per worker]].
- SAME WORKER COUNT: exactly [[2 or 3]].
- SAME CAMERA: static [[eye-level/elevated]], no pan, no zoom, no shake.
- SAME LIGHTING: [[natural daylight from left window + overhead work light]].
- SAME BACKGROUND: [[all non-stone elements frozen]].

MOTION QUALITY:
- Smooth, continuous, no jump cuts.
- Workers move naturally — walking speed, realistic arm movement, weight-appropriate slab handling.
- Tools picked up / put down with physical plausibility.
- No teleportation, no object pop-in/out.

NEGATIVE CONSTRAINTS:
- No face swap between workers.
- No wardrobe change mid-clip.
- No body scale drift.
- No identity morph (hair change, beard change, skin tone change).
- No geometry drift (cabinet doors shifting, walls moving).
- No flicker or strobe effect.
- No extra/missing workers appearing/disappearing.

Duration: [[5-8]] seconds. Photorealistic construction documentation.
```

---

## BƯỚC 5: CAPTION + HASHTAGS (VIRAL SOCIAL)

### Facebook Caption:
```text
✦ From Bare Cabinets to Stunning Stone ✦
Watch [[STONE_NAME]] come to life in this Melbourne kitchen 🎬

🪨 Every slab. Every seam. Every detail — perfection in progress.

◆ 100% CSF Compliant ✅
◆ Expert installation by our Melbourne team
◆ [[STONE_DESCRIPTION — 1 line]]

━━━━━━━━━━━━━━━━━━
📍 PVStoneau — Premium Stone Benchtops Melbourne
📞 0450 938 079 | 📩 DM for FREE quote
🌐 pvstone.com.au

#PVStoneau #StoneInstallation #Timelapse #MelbourneKitchen #StoneBenchtops #KitchenRenovation #BeforeAndAfter #EngineeredStone #CSFCompliant #PremiumStone #AustralianHomes #[[STONE_HASHTAG]]
```

### Instagram Caption:
```text
From dust to designer ✨

[[STONE_NAME]] installation timelapse — swipe to see every stage 👉

Every cut precise. Every seam invisible. Every detail, premium.

🪨 100% CSF Compliant
📍 Melbourne kitchen project

—
Tag someone planning a kitchen reno 👇
DM us for a free quote ✉️

.
.
.
#kitchenreno #stonemason #melbournebuilder #benchtops #kitchendesign #stoneinstallation #timelapse #beforeandafter #renovationmelbourne #luxurykitchen #engineeredstone #interiordesignmelbourne #pvstone #[[STONE_HASHTAG]]
```

---

## BƯỚC 6: OUTPUT & CHECKLIST

```
📋 TIMELAPSE SCRIPT CHECKLIST — [[STONE_NAME]]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👷 WORKER IDENTITY LOCK:
  ✅ Worker A: [[name/description]] — LOCKED
  ✅ Worker B: [[name/description]] — LOCKED
  ✅ Worker C: [[name/description]] — LOCKED (if applicable)

🖼️ IMAGE KEYFRAMES (10-12):
  □ T01: Site protection setup
  □ T02: Slab transport
  □ T03: Level check
  □ T04: Dry-fit
  □ T05: Epoxy/silicone prep
  □ T06: Adhesive application
  □ T07: Slab placement
  □ T08: Seam setting
  □ T09: Excess cleanup
  □ T10: Polish & final clean
  □ T11: Close-up finished surface
  □ T12: Wide reveal shot

🎬 VIDEO TRANSITIONS (9-11):
  □ T01→T02, T02→T03, ..., T11→T12
  □ Each 5-8 seconds
  □ Identity lock verified per transition

📝 CAPTIONS:
  □ Facebook caption (viral format) ✅
  □ Instagram caption (viral format) ✅
  □ Hashtags ✅

🔍 VERIFY BEFORE RENDER:
  □ Same 2-3 workers in ALL keyframes
  □ Same outfits/PPE in ALL keyframes
  □ Same camera angle across timeline
  □ Same lighting conditions (or gradual natural change)
  □ No object teleportation between frames
  □ Stone colour consistent with reference
```

Agent lưu output vào `.github/stone-content/scripts/YYYY-MM-DD-HHMM-[STONE_CODE]-timelapse-script.md`.

---

## RECOMMENDED TOOLS & WORKFLOW

| Stage | Recommended Tool | Why |
|-------|-----------------|-----|
| Image Keyframes | **Google Flow** (labs.google/fx/tools/flow) | Best for photorealistic still images with reference |
| Video Transitions | **Kling AI 3.0** or **Google Veo 3.1** | Start/End frame control for smooth interpolation |
| Character Consistency | **Anchor Image method** | Upload master worker images as reference every clip |
| Assembly | **DaVinci Resolve** or **CapCut** | Stitch clips, add music, speed ramps |

> **Pro Tip:** Batch generation into 5-8 second segments. If one segment drifts, re-generate only that clip.
> Always use the ORIGINAL master worker anchor image as reference — never chain from a previous AI output.
