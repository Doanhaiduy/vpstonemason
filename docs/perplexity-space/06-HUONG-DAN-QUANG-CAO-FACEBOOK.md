# HƯỚNG DẪN QUẢNG CÁO FACEBOOK & INSTAGRAM — VPStoneMason & Co.

> Hướng dẫn chi tiết từ A-Z cách chạy quảng cáo Facebook/Instagram Ads cho ngành đá benchtop tại Úc.

---

## 1. TỔNG QUAN & CHUẨN BỊ

### 1.1 Tại sao Facebook/Instagram Ads?
- 77% người Úc sử dụng Facebook, 55% dùng Instagram
- Ngành renovation = visual-first → Instagram/Facebook là kênh lý tưởng
- Khả năng target chính xác: vị trí, tuổi, sở thích, hành vi
- Chi phí hiệu quả hơn Google Ads cho giai đoạn awareness
- Retargeting: tiếp cận lại người đã visit website

### 1.2 Công cụ cần có:
| Công cụ | Mục đích | Cách setup |
|---------|----------|------------|
| **Facebook Business Page** | Trang doanh nghiệp chính | facebook.com/pages/create |
| **Instagram Business Account** | Tài khoản IG doanh nghiệp | Chuyển từ personal → business trong Settings |
| **Meta Business Suite** | Quản lý cả FB + IG | business.facebook.com |
| **Meta Ads Manager** | Tạo & quản lý quảng cáo | adsmanager.facebook.com |
| **Meta Pixel** | Tracking trên website | Cài đặt trong Events Manager |
| **Conversions API** | Tracking nâng cao (server-side) | Setup trong Events Manager |

### 1.3 Cài đặt Meta Pixel:

**Bước 1:** Vào Meta Events Manager → Tạo Pixel mới
**Bước 2:** Lấy Pixel ID (dạng số: 123456789012345)
**Bước 3:** Thêm vào website Next.js:

Thêm vào file `layout.tsx` hoặc tạo component riêng:
```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID_HERE');
fbq('track', 'PageView');
</script>
```

**Bước 4:** Setup Standard Events:
- `ViewContent` → Khi xem trang sản phẩm (stone detail page)
- `Lead` → Khi gửi contact form / quote request
- `Contact` → Khi click số điện thoại
- `Schedule` → Khi book consultation

---

## 2. CẤU TRÚC CAMPAIGN (Chiến dịch)

### 2.1 Chiến lược Full-Funnel:

```
┌─────────────────────────────────────────────────┐
│  TOFU — Top of Funnel (Awareness / Reach)       │
│  Mục tiêu: Cho nhiều người biết đến brand       │
│  Budget: 30% tổng chi                           │
│  Audience: Broad — homeowners Melbourne         │
│  Content: Video, Carousel, Beautiful photos     │
├─────────────────────────────────────────────────┤
│  MOFU — Middle of Funnel (Consideration)        │
│  Mục tiêu: Engage và educate                    │
│  Budget: 30% tổng chi                           │
│  Audience: Engaged users + Website visitors     │
│  Content: Blog posts, testimonials, comparisons │
├─────────────────────────────────────────────────┤
│  BOFU — Bottom of Funnel (Conversion)           │
│  Mục tiêu: Thu lead, book consultation          │
│  Budget: 40% tổng chi                           │
│  Audience: Retargeting warm audiences           │
│  Content: Offers, quote CTA, urgency            │
└─────────────────────────────────────────────────┘
```

### 2.2 Campaigns cần tạo:

#### Campaign 1: AWARENESS — Brand Introduction
```
Objective: Awareness / Reach
Budget: $150-200/tuần
Audience: Broad targeting
Duration: Always-on (chạy liên tục)

Ad Sets:
├── Ad Set 1: Melbourne Metro - Homeowners 30-65
├── Ad Set 2: Geelong & Regional VIC - Homeowners 30-65
└── Ad Set 3: Lookalike - Similar to website visitors

Ads:
├── Ad 1: Video tour showroom (30 sec)
├── Ad 2: Carousel - "Our Stone Range" (6 slides)
└── Ad 3: Single image - Beautiful completed kitchen
```

#### Campaign 2: TRAFFIC — Drive to Website
```
Objective: Traffic
Budget: $100-150/tuần
Audience: Interest-based targeting
Duration: Always-on

Ad Sets:
├── Ad Set 1: Interest: Kitchen Renovation + Home Improvement
├── Ad Set 2: Interest: Interior Design + Houzz + Architecture
└── Ad Set 3: Interest: Real Estate + Property Investment

Ads:
├── Ad 1: Blog post - "How to Choose Stone Benchtop"
├── Ad 2: Stone catalogue page
└── Ad 3: Project showcase page
```

#### Campaign 3: LEAD GENERATION — Collect Enquiries
```
Objective: Lead Generation (Instant Forms)
Budget: $200-300/tuần
Audience: Retargeting + Warm audiences
Duration: Always-on (tối ưu liên tục)

Ad Sets:
├── Ad Set 1: Website visitors (last 90 days)
├── Ad Set 2: Facebook/IG engagers (last 60 days)
└── Ad Set 3: Lookalike of past leads/customers

Lead Form Questions:
1. Full Name (auto-fill)
2. Email (auto-fill)
3. Phone Number (auto-fill)
4. "What type of project?" → Kitchen / Bathroom / Laundry / Other
5. "When are you looking to start?" → ASAP / 1-3 months / 3-6 months / Just researching
6. "Your suburb?" → Open text

Ads:
├── Ad 1: "Get a FREE Quote in 24 Hours"
├── Ad 2: "Book Your FREE Consultation"
└── Ad 3: "Limited Time: 10% Off Selected Stones"
```

#### Campaign 4: RETARGETING — Convert Warm Leads
```
Objective: Conversions
Budget: $100-150/tuần
Audience: Specific retargeting
Duration: Always-on

Ad Sets:
├── Ad Set 1: Visited stone pages but didn't enquire (7-30 days)
├── Ad Set 2: Started contact form but didn't submit (7-14 days)
└── Ad Set 3: Past customers (upsell/referral)

Ads:
├── Ad 1: "Still Looking? Here's Why Homeowners Choose Us"
├── Ad 2: Testimonial video from happy customer
└── Ad 3: "Your Dream Kitchen is Just One Call Away"
```

---

## 3. TARGET AUDIENCE CHI TIẾT

### 3.1 Demographics (Nhân khẩu học):
- **Tuổi**: 30-65 (chủ nhà có khả năng tài chính)
- **Giới tính**: All (nhưng women thường quyết định design)
- **Vị trí**: Melbourne + 50km radius, OR specific suburbs/postcodes
- **Ngôn ngữ**: English (All)

### 3.2 Interest Targeting (Sở thích):

**Nhóm 1 — Home Renovation:**
```
Home improvement
Kitchen renovation
Bathroom renovation
Home renovation
DIY home improvement
Bunnings Warehouse
```

**Nhóm 2 — Interior Design:**
```
Interior design
Houzz
Architecture Digest
Home Beautiful (magazine)
House & Garden
Pinterest (interior design)
```

**Nhóm 3 — Real Estate/Property:**
```
Real estate
Realestate.com.au
Domain.com.au
Property investment
Home buying
```

**Nhóm 4 — Luxury/Lifestyle:**
```
Luxury goods
Fine dining
Premium brands
Home entertaining
Gourmet cooking
```

### 3.3 Behavioral Targeting:
```
Homeowners (behavior)
Likely to move (behavior)
Recently moved (behavior)
Engaged shoppers
Online buyers
```

### 3.4 Custom Audiences (Tự tạo):
| Audience | Source | Window |
|----------|--------|--------|
| Website Visitors (All) | Meta Pixel | 180 days |
| Stone Page Visitors | Meta Pixel — URL contains /stones | 90 days |
| Contact Page Visitors | Meta Pixel — URL = /contact | 30 days |
| Facebook Page Engagers | FB Page | 90 days |
| Instagram Engagers | IG Profile | 90 days |
| Video Viewers (50%+) | Video engagement | 60 days |
| Customer Email List | Upload CSV | - |
| Lead Form Submitters | Lead form | 90 days |

### 3.5 Lookalike Audiences (Khán giả tương tự):
```
1% Lookalike — Website Visitors → Best performing
1% Lookalike — Lead Form Submitters → High quality
1% Lookalike — Customer List → Highest value
2% Lookalike — Facebook Engagers → Broader reach
```

---

## 4. CREATIVE (Nội dung quảng cáo)

### 4.1 Ad Copy Templates:

**Template 1 — Product Focus:**
```
Headline: Premium [Stone Type] Benchtops | Melbourne
Primary Text:
Transform your kitchen with stunning [Stone Name] benchtops 💎

✅ Locally fabricated in our Melbourne workshop
✅ 100% CSF compliant & safe
✅ Professional installation in as little as 5 days
✅ Free consultation & quote

📞 (03) 9000 0000
📍 Visit our Richmond showroom

CTA Button: Get Quote
Link: https://pvstone.com.au/contact
```

**Template 2 — Before/After:**
```
Headline: From Tired Kitchen to Dream Kitchen ✨
Primary Text:
See how we transformed this [Suburb] kitchen with gorgeous [Stone Name] benchtops!

🪨 Material: [Stone Type]
⏱️ Installation time: [X] days
💰 Budget-friendly options available

Ready for YOUR transformation?
👉 Book a FREE consultation today

CTA Button: Learn More
Link: https://pvstone.com.au/projects
```

**Template 3 — Lead Generation:**
```
Headline: FREE Kitchen Benchtop Quote — 24hr Response
Primary Text:
Planning a kitchen renovation in Melbourne? 🏠

Get a FREE, no-obligation quote from Victoria's trusted stonemasons.

What you get:
✅ Personalised recommendation for your kitchen
✅ Transparent, itemised pricing
✅ Free on-site measure (metro Melbourne)
✅ 5-year workmanship guarantee

Over 15 years of experience | 500+ happy homes

CTA Button: Get Quote
→ Opens Lead Form
```

**Template 4 — Testimonial/Social Proof:**
```
Headline: See Why Melbourne Homeowners Choose VPStoneMason
Primary Text:
⭐⭐⭐⭐⭐ "Absolutely thrilled with our new kitchen benchtops. The team was professional from measure to install. Highly recommend!" — James & Sarah M., Brighton

Join hundreds of happy homeowners across Melbourne.

📞 (03) 9000 0000
🌐 pvstone.com.au

CTA Button: Book Consultation
```

**Template 5 — CSF Education:**
```
Headline: Safe, Stunning & Compliant Stone Benchtops
Primary Text:
Did you know? Since July 2024, traditional engineered stone is banned in Australia due to silica health risks.

VPStoneMason offers 100% CSF (Crystalline Silica Free) alternatives:
🪨 Same beautiful aesthetics
🛡️ Zero health risk to fabricators
✅ Fully compliant with Australian regulations
💎 Premium quality guaranteed

Learn more about your safe options:

CTA Button: Learn More
Link: https://pvstone.com.au/stones?category=csf-stone
```

### 4.2 Image/Video Specs:

| Format | Kích thước | Tỷ lệ | Duration |
|--------|-----------|--------|----------|
| Feed Image | 1080 x 1080 px | 1:1 | - |
| Feed Carousel | 1080 x 1080 px | 1:1 | Max 10 slides |
| Feed Video | 1080 x 1080 px | 1:1 hoặc 4:5 | 15-60 sec |
| Stories/Reels | 1080 x 1920 px | 9:16 | 15-30 sec |
| Facebook Link Ad | 1200 x 628 px | 1.91:1 | - |

### 4.3 Creative Best Practices:
1. **Ảnh thật** — KHÔNG dùng stock photos. Ảnh dự án thật luôn perform tốt hơn
2. **Trước/Sau** — Before/After luôn có engagement cao
3. **Video ngắn** — 15-30 giây cho Stories/Reels, tối đa 60 giây cho Feed
4. **Text on image** — Giữ dưới 20% text trên ảnh (Meta guideline)
5. **Bright, well-lit photos** — Đá cần ánh sáng tốt để hiện màu đúng
6. **Show scale** — Cho thấy đá trong context thực tế (nhà bếp, người đứng cạnh)
7. **Mobile-first** — 95%+ người xem trên mobile, thiết kế cho màn nhỏ

---

## 5. BUDGET & BID STRATEGY

### 5.1 Budget đề xuất theo giai đoạn:

**Giai đoạn 1: Testing (Tháng 1-2):**
```
Tổng budget: $300-500/tuần ($1,200-2,000/tháng)
├── Awareness: $100/tuần
├── Traffic: $100/tuần
├── Lead Gen: $150/tuần
└── Retargeting: $50-150/tuần

Mục tiêu: Test audiences, creatives, messages
KPI: CPM < $15, CPC < $2, CPL < $50
```

**Giai đoạn 2: Scaling (Tháng 3-6):**
```
Tổng budget: $500-800/tuần ($2,000-3,200/tháng)
├── Awareness: $100-150/tuần
├── Traffic: $100-150/tuần
├── Lead Gen: $200-350/tuần
└── Retargeting: $100-150/tuần

Mục tiêu: Scale winning ads, expand audiences
KPI: CPL < $40, Conversion Rate > 3%
```

**Giai đoạn 3: Optimization (Tháng 6+):**
```
Tổng budget: $800-1,500/tuần ($3,200-6,000/tháng)
Focus: Chỉ chạy ads có ROI dương
Tắt ads CPL > $60
Scale ads CPL < $30
```

### 5.2 Bidding Strategy:
- **Awareness campaigns**: Lowest cost (tự động)
- **Traffic campaigns**: Lowest cost per click
- **Lead Gen campaigns**: Cost cap ($40-50 per lead)
- **Retargeting**: Lowest cost (audience nhỏ, không cần cap)

### 5.3 Theo dõi KPIs:

| Metric | Mục tiêu | Cách cải thiện |
|--------|----------|----------------|
| **CPM** (Cost per 1000 impressions) | < $15 | Cải thiện audience targeting |
| **CPC** (Cost per click) | < $2.00 | Cải thiện creative/ad copy |
| **CTR** (Click-through rate) | > 1.5% | Test headlines & images mới |
| **CPL** (Cost per lead) | < $40-50 | Optimize lead form, retarget |
| **Lead-to-Quote Rate** | > 50% | Improve lead quality filters |
| **Quote-to-Sale Rate** | > 20% | Improve sales follow-up |
| **ROAS** (Return on Ad Spend) | > 5x | Focus budget on best performers |

---

## 6. A/B TESTING (Thử nghiệm)

### Những gì cần test:
1. **Headlines**: Test 3-5 headline variations per ad set
2. **Images vs Video**: Xem format nào perform tốt hơn
3. **Ad Copy length**: Short (2-3 lines) vs Long (6-8 lines)
4. **CTA buttons**: "Get Quote" vs "Learn More" vs "Contact Us"
5. **Audiences**: Interest-based vs Lookalike vs Broad
6. **Placements**: Facebook Feed vs Instagram Feed vs Stories
7. **Time of day**: Morning vs Lunch vs Evening

### Quy tắc test:
- Test 1 biến số tại 1 thời điểm
- Chạy ít nhất 3-5 ngày trước khi kết luận
- Cần ít nhất 1,000 impressions per variation
- Tắt ad có CTR < 0.5% sau 3 ngày
- Scale ad có CPL tốt nhất bằng cách tăng budget 20%/ngày

---

## 7. LANDING PAGES

### Quan trọng: KHÔNG gửi traffic ads về homepage!

### Landing Page cho Lead Gen Ads:
URL: `/contact` hoặc tạo dedicated landing pages

**Cấu trúc landing page hiệu quả:**
```
1. Hero Section:
   - Headline: "Get Your FREE Stone Benchtop Quote Today"
   - Sub: "Melbourne's trusted stonemasons — 15+ years experience"
   - CTA Button: "Get My Free Quote"

2. Social Proof:
   - "500+ Happy Melbourne Homes"
   - 3 review stars + short testimonials

3. What's Included:
   - ✅ Free consultation
   - ✅ Free on-site measure (metro Melbourne)
   - ✅ Transparent, no-hidden-cost pricing
   - ✅ 5-year workmanship guarantee

4. Quote Form:
   - Name, Email, Phone
   - Project type (dropdown)
   - Suburb
   - Message (optional)
   - Submit button: "Get My Free Quote"

5. Trust Badges:
   - Master Builders member
   - CSF Compliant
   - 15+ Years Experience
```

---

## 8. REMARKETING STRATEGY CHI TIẾT

### Remarketing Flow:
```
Ngày 1-3:   Visited website → Show testimonial ad
Ngày 4-7:   Still no action → Show "Get FREE quote" ad
Ngày 8-14:  Still no action → Show limited-time offer
Ngày 15-30: Still no action → Show project showcase ad
Ngày 30+:   Move to cold audience nurturing
```

### Dynamic Ads:
- Hiển thị lại chính xác loại đá mà khách đã xem trên website
- Setup: cần Product Catalog trong Meta Business Suite
- CTA: "Still interested in [Stone Name]? Get a quote today!"

---

## 9. BÁO CÁO & PHÂN TÍCH

### Weekly Report Template:
```
📊 TUẦN [X] — Facebook/Instagram Ads Report

Tổng chi: $XXX
Impressions: XX,XXX
Clicks: XXX
CTR: X.X%
Leads: XX
CPL: $XX.XX
Leads → Quotes: XX
Quotes → Sales: X

Top Performing Ad: [Name]
Worst Performing Ad: [Name] → Đề xuất: [Tắt/Sửa]

Action Items:
- [ ] Scale ad [Name] — tăng budget 20%
- [ ] Tạo creative mới cho [Campaign]
- [ ] Update audience excluding recent converters
```

### Monthly Review Checklist:
- [ ] Review tất cả CPL — tắt ads CPL > $60
- [ ] Refresh creative (ads cũ > 30 ngày)
- [ ] Update Custom Audiences
- [ ] Check Pixel firing correctly
- [ ] Review landing page conversion rate
- [ ] Compare month-over-month performance
- [ ] Adjust budget allocation based on performance

---

## 10. GOOGLE ADS (Bổ sung)

### Nên chạy Google Ads song song cho:
- **Google Search Ads**: Target người đang search "kitchen benchtop Melbourne", "marble benchtop price", etc.
- **Google Display**: Hiển thị banner trên các website renovation/design
- **Google My Business**: Tối ưu listing, reviews, photos

### Keywords quan trọng cho Google Ads:
```
stone benchtop melbourne
kitchen benchtop price melbourne
marble benchtop cost
granite benchtop installation
csf stone benchtop
stonemason melbourne
kitchen renovation melbourne
best stone for kitchen benchtop
porcelain benchtop australia
quartzite benchtop melbourne
```

> **Lưu ý**: Google Ads phức tạp hơn Facebook, nên cân nhắc thuê chuyên gia hoặc agency nếu budget cho phép. Facebook Ads nên là ưu tiên đầu tiên.
