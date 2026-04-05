# 🪨 TASK: SEED BLOG POSTS — VPStoneMason Website

## 📋 OVERVIEW

You are working on the **VPStoneMason & Co.** website — a premium stone benchtop fabricator based in Melbourne, Australia.

**Goal**: Delete all existing blog posts from the database, then seed 15 new, high-quality SEO-optimised blog posts with images sourced from Unsplash and hosted on Cloudinary.

---

## 🛠️ TECH REQUIREMENTS

Before starting, identify the following from the existing codebase:

- [ ] Database type (PostgreSQL / MongoDB / Supabase / Prisma / etc.)
- [ ] ORM or query method (Prisma, Mongoose, Drizzle, raw SQL, etc.)
- [ ] Blog schema/model — identify all fields (title, slug, content, excerpt, featuredImage, images, author, publishedAt, category, tags, seoTitle, seoDescription, readTime, etc.)
- [ ] Cloudinary credentials — look for `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`
- [ ] Unsplash Access Key — if available in `.env` as `UNSPLASH_ACCESS_KEY` (optional — fallback to direct URL if not available)

---

## 🖼️ IMAGE STRATEGY

### Step 1 — Fetch from Unsplash

Use the **Unsplash Source API** (no auth required):
```
https://source.unsplash.com/1600x900/?{keyword}
```

Or if Unsplash API key is available, use the official API:
```
GET https://api.unsplash.com/photos/random?query={keyword}&count=5
Authorization: Client-ID {UNSPLASH_ACCESS_KEY}
```

**Keywords per post** are specified in the blog list below.

### Step 2 — Upload to Cloudinary

For each image URL fetched from Unsplash:
```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const result = await cloudinary.uploader.upload(unsplashUrl, {
  folder: 'vpstonemason/blog',
  resource_type: 'image',
  transformation: [{ width: 1600, height: 900, crop: 'fill', quality: 'auto' }]
});

const cloudinaryUrl = result.secure_url; // Use this in DB
```

### Image count per post:
- `featuredImage`: 1 image (main hero image)
- `images[]`: 3–5 additional images within the article body
- Total per post: **4–6 Cloudinary URLs**

---

## 🗑️ STEP 1 — DELETE OLD BLOG POSTS

```js
// Prisma example
await prisma.post.deleteMany({});

// Mongoose example
await BlogPost.deleteMany({});

// SQL example
await db.query('DELETE FROM blog_posts;');
```

Confirm deletion before seeding. Log count deleted.

---

## ✍️ STEP 2 — BLOG POST CONTENT REQUIREMENTS

Each blog post MUST have:

| Field | Requirement |
|-------|-------------|
| `title` | SEO-optimised H1, as specified below |
| `slug` | URL-friendly, lowercase, hyphenated |
| `excerpt` | 2–3 sentence summary (150–160 chars) |
| `content` | Full HTML body: **1,500–2,500 words**, proper H2/H3 structure |
| `featuredImage` | Cloudinary URL (1600×900) |
| `images` | Array of 3–5 Cloudinary URLs embedded in content |
| `author` | "VPStoneMason Team" |
| `publishedAt` | Staggered dates: start from 2025-08-01, one post per week |
| `category` | As specified per post |
| `tags` | 4–6 relevant tags |
| `seoTitle` | ≤60 chars |
| `seoDescription` | 150–160 chars, include CTA |
| `readTime` | Calculated: word count ÷ 200 (round up) |

### Content Structure (HTML format):
```html
<article>
  <p class="lead">[Engaging intro paragraph — hook the reader]</p>
  
  <h2>[Section 1 Title]</h2>
  <p>[2–3 paragraphs of informative content]</p>
  <img src="[CLOUDINARY_URL]" alt="[descriptive alt text]" />
  
  <h2>[Section 2 Title]</h2>
  <p>[Content...]</p>
  
  <h3>[Sub-section if needed]</h3>
  <p>[Content...]</p>
  
  <!-- Include a comparison table where relevant -->
  <table>...</table>
  
  <h2>[Section 3–5 continuing...]</h2>
  <img src="[CLOUDINARY_URL]" alt="..." />
  
  <h2>Ready to Transform Your Kitchen?</h2>
  <p>[CTA paragraph — mention free consultation, Melbourne-based, 15+ years experience]</p>
  <a href="/contact" class="cta-button">Get a Free Quote Today</a>
</article>
```

### Tone & Style Guide:
- **Audience**: Australian homeowners planning kitchen/bathroom renovations in Melbourne & Victoria
- **Tone**: Expert but approachable. Confident. Trustworthy. No jargon without explanation.
- **Brand**: Family-owned, 15+ years, Australian craftsmanship, premium quality
- **Important**: Always mention CSF (Crystalline Silica-Free) stone is compliant with Australia's engineered stone ban (effective 1 July 2024) when relevant
- **Pricing**: Use ranges in AUD e.g. "$350–$750/m² installed" — never exact prices without "prices are indicative, contact us for a quote"
- **Location mentions**: Melbourne, Victoria, Richmond, South Yarra, Brighton, Toorak, Geelong — sprinkle naturally

---

## 📝 STEP 3 — THE 15 BLOG POSTS

---

### POST 1
**Title**: How Much Does a Stone Benchtop Cost in Melbourne? 2026 Complete Price Guide  
**Slug**: `stone-benchtop-cost-melbourne-2026`  
**Category**: Pricing & Budgeting  
**Tags**: `pricing`, `kitchen renovation`, `melbourne`, `budget guide`, `benchtop cost`  
**SEO Title**: Stone Benchtop Cost Melbourne 2026 | Price Guide  
**SEO Description**: Find out how much stone benchtops cost in Melbourne in 2026. Compare granite, marble, quartz & CSF stone prices per m². Get a free quote today.  
**Unsplash Keywords**: `kitchen marble benchtop`, `luxury kitchen renovation`, `stone countertop`  
**Key sections to cover**:
- Average price ranges by stone type (AUD/m² installed)
- What's included in the price (fabrication + installation)
- Factors that affect cost (stone type, edge profile, cutouts, size)
- Granite vs Marble vs Quartz vs CSF vs Porcelain price comparison table
- Tips to stay on budget without compromising quality
- Why Melbourne pricing differs from national averages
- CTA: Free measure and quote

---

### POST 2
**Title**: Granite vs Marble vs Quartz: The Complete Australian Benchtop Comparison Guide  
**Slug**: `granite-vs-marble-vs-quartz-australia`  
**Category**: Stone Comparison  
**Tags**: `granite`, `marble`, `quartz`, `comparison`, `benchtop guide`  
**SEO Title**: Granite vs Marble vs Quartz Benchtops Australia  
**SEO Description**: Compare granite, marble and quartz benchtops for Australian kitchens. Durability, maintenance, cost and style — which stone is right for you?  
**Unsplash Keywords**: `marble kitchen`, `granite benchtop`, `quartz stone surface`  
**Key sections**:
- Overview of each stone type
- Durability & hardness comparison (Mohs scale)
- Heat resistance, scratch resistance, stain resistance
- Maintenance requirements
- Price ranges
- Best use cases (kitchen vs bathroom vs outdoor)
- Side-by-side comparison table
- How to decide which is right for your home
- CTA

---

### POST 3
**Title**: Understanding the Engineered Stone Ban in Australia: What Every Homeowner Needs to Know  
**Slug**: `engineered-stone-ban-australia-homeowners-guide`  
**Category**: Industry News & Regulations  
**Tags**: `engineered stone ban`, `CSF stone`, `crystalline silica`, `australia regulations`, `safe stone`  
**SEO Title**: Australia Engineered Stone Ban 2024 | Homeowner Guide  
**SEO Description**: Australia banned engineered stone with over 1% crystalline silica from 1 July 2024. Learn what this means and which safe alternatives are available.  
**Unsplash Keywords**: `kitchen renovation australia`, `modern kitchen design`, `stone benchtop`  
**Key sections**:
- What is the engineered stone ban? (July 1, 2024)
- Why was it banned? (silicosis health risk for workers)
- What does it mean for homeowners?
- What products are affected?
- What are the safe CSF alternatives?
- How VPStoneMason is 100% compliant
- Timeline of the ban
- FAQ section
- CTA

---

### POST 4
**Title**: Top 10 Kitchen Benchtop Trends in Australia for 2026  
**Slug**: `kitchen-benchtop-trends-australia-2026`  
**Category**: Design & Trends  
**Tags**: `kitchen trends 2026`, `design inspiration`, `benchtop trends`, `australia`, `interior design`  
**SEO Title**: Kitchen Benchtop Trends Australia 2026 | Top 10 List  
**SEO Description**: Discover the top 10 kitchen benchtop trends dominating Australian homes in 2026. From Calacatta marble to CSF stone and waterfall edges.  
**Unsplash Keywords**: `modern kitchen design 2024`, `luxury kitchen interior`, `marble kitchen island`  
**Key sections**:
- #1 Calacatta Marble — the timeless classic
- #2 CSF Stone — safety-first luxury
- #3 Waterfall edges — dramatic statement
- #4 Honed/leathered finishes over polished
- #5 Warm neutral tones (cream, beige, taupe)
- #6 Large format slabs (minimal seams)
- #7 Fluted stone panels (new trend)
- #8 Dark dramatic stones (Forest Green, Nero Marquina)
- #9 Quartzite — the premium natural alternative
- #10 Porcelain — ultra-thin, ultra-modern
- CTA

---

### POST 5
**Title**: How to Choose the Perfect Stone Benchtop for Your Kitchen: A Step-by-Step Guide  
**Slug**: `how-to-choose-stone-benchtop-kitchen`  
**Category**: Buying Guide  
**Tags**: `buying guide`, `stone selection`, `kitchen design`, `benchtop choice`, `melbourne`  
**SEO Title**: How to Choose a Stone Benchtop for Your Kitchen  
**SEO Description**: Not sure which stone benchtop is right for your kitchen? Follow our step-by-step guide to choose the perfect stone based on lifestyle, budget and style.  
**Unsplash Keywords**: `kitchen design inspiration`, `stone samples`, `kitchen renovation planning`  
**Key sections**:
- Step 1: Define your lifestyle (busy family vs entertainer vs minimalist)
- Step 2: Set your budget
- Step 3: Choose your stone type
- Step 4: Select finish (polished/honed/leathered/brushed)
- Step 5: Choose your edge profile
- Step 6: Consider thickness (20mm vs 30mm vs 40mm)
- Step 7: Think about colour and cabinet pairing
- Step 8: Visit a showroom and see samples in your lighting
- Common mistakes to avoid
- CTA: Free consultation

---

### POST 6
**Title**: CSF Stone: Everything You Need to Know About Australia's Safest Benchtop Alternative  
**Slug**: `csf-stone-crystalline-silica-free-guide-australia`  
**Category**: Products & Materials  
**Tags**: `CSF stone`, `crystalline silica free`, `safe benchtop`, `engineered stone alternative`, `australia`  
**SEO Title**: CSF Stone Australia | Crystalline Silica-Free Guide  
**SEO Description**: CSF (Crystalline Silica-Free) stone is Australia's compliant answer to the engineered stone ban. Learn what it is, how it performs and why it's the smart choice.  
**Unsplash Keywords**: `white kitchen benchtop`, `modern stone surface`, `luxury kitchen countertop`  
**Key sections**:
- What is CSF Stone?
- Why it was developed (in response to the ban)
- How it's manufactured
- Performance comparison vs old engineered stone
- Brands available in Australia (Smartstone CSF, Essastone CSF, etc.)
- Colours and finishes available
- Price comparison
- Is it as good as traditional engineered stone?
- Health and safety compliance explained
- CTA

---

### POST 7
**Title**: Porcelain Benchtops: The Ultimate Low-Maintenance Kitchen Surface for Australian Homes  
**Slug**: `porcelain-benchtops-australia-guide`  
**Category**: Products & Materials  
**Tags**: `porcelain benchtop`, `low maintenance`, `kitchen surface`, `porcelain stone`, `australia`  
**SEO Title**: Porcelain Benchtops Australia | Complete Guide 2026  
**SEO Description**: Porcelain benchtops are scratch-proof, heat-proof and virtually maintenance-free. Discover why more Australians are choosing porcelain for their kitchens.  
**Unsplash Keywords**: `porcelain kitchen`, `modern kitchen renovation`, `minimalist kitchen design`  
**Key sections**:
- What is porcelain benchtop (vs ceramic)?
- Key benefits: heat resistant, scratch resistant, UV stable, low maintenance
- Large format slabs (1200×2400mm+)
- Available thicknesses (6mm, 12mm, 20mm)
- Indoor vs outdoor use
- Colour and texture range
- Installation requirements (different from stone)
- Price vs other materials
- Who is porcelain best for?
- Limitations to know
- CTA

---

### POST 8
**Title**: Stone Benchtop Edge Profiles Explained: A Complete Visual Guide for Australian Homeowners  
**Slug**: `stone-benchtop-edge-profiles-guide`  
**Category**: Design & Trends  
**Tags**: `edge profiles`, `benchtop edges`, `waterfall edge`, `mitre edge`, `stone design`  
**SEO Title**: Stone Benchtop Edge Profiles Guide | VPStoneMason  
**SEO Description**: From pencil round to waterfall mitre — learn about all stone benchtop edge profiles, their cost, look and where they work best in Australian kitchens.  
**Unsplash Keywords**: `kitchen benchtop edge detail`, `marble countertop edge`, `stone kitchen island`  
**Key sections**:
- Why edge profiles matter (aesthetics + safety + cost)
- Profile 1: Square/eased (modern, budget-friendly)
- Profile 2: Pencil round (soft, timeless)
- Profile 3: Bullnose (classic, rounded)
- Profile 4: Bevelled (elegant, catches light)
- Profile 5: Waterfall/mitre (dramatic, luxury)
- Profile 6: Ogee (decorative, traditional)
- Profile 7: Dupont (bold, restaurant style)
- Profile 8: Laminated/stacked edge (thick appearance)
- Price comparison table
- Which edge suits which kitchen style
- Tips from our stonemasons
- CTA

---

### POST 9
**Title**: How to Care for Your Natural Stone Benchtop: The Complete Australian Maintenance Guide  
**Slug**: `how-to-care-for-natural-stone-benchtop`  
**Category**: Care & Maintenance  
**Tags**: `stone care`, `maintenance guide`, `sealing stone`, `cleaning benchtop`, `natural stone`  
**SEO Title**: How to Care for Natural Stone Benchtops | Full Guide  
**SEO Description**: Keep your stone benchtops looking beautiful for decades. Learn how to clean, seal and protect granite, marble and quartzite in Australian homes.  
**Unsplash Keywords**: `kitchen cleaning marble`, `stone countertop care`, `luxury kitchen maintenance`  
**Key sections**:
- Why natural stone needs special care (porous nature)
- Daily cleaning: what to use and what to avoid
- Granite care routine
- Marble care routine (extra considerations — etching)
- Quartzite care routine
- Sealing: when and how to seal your stone
- DIY sealing step-by-step
- Removing stains: oil, wine, coffee, rust
- What NEVER to use on stone (bleach, vinegar, abrasives)
- Seasonal deep clean tips
- CTA: Professional stone restoration services

---

### POST 10
**Title**: Quartzite vs Marble: Beauty vs Durability — Which is the Right Choice for Your Home?  
**Slug**: `quartzite-vs-marble-comparison-australia`  
**Category**: Stone Comparison  
**Tags**: `quartzite`, `marble`, `stone comparison`, `natural stone`, `benchtop guide`  
**SEO Title**: Quartzite vs Marble Benchtops Australia | 2026 Guide  
**SEO Description**: Quartzite and marble look similar but perform very differently. Compare durability, maintenance, cost and aesthetics to find the right stone for your kitchen.  
**Unsplash Keywords**: `marble quartzite kitchen`, `natural stone benchtop`, `luxury kitchen white stone`  
**Key sections**:
- What is quartzite? (often confused with quartz)
- What is marble?
- Visual comparison — can you tell them apart?
- Durability comparison (Mohs hardness)
- Porosity and stain resistance
- Heat resistance comparison
- Etching: marble's Achilles heel
- Price comparison
- Maintenance requirements
- Which is better for kitchens? Bathrooms?
- Best quartzite varieties in Australia (Taj Mahal, Calacatta Macchia)
- Best marble varieties (Calacatta Gold, Statuario, Carrara)
- Side-by-side comparison table
- CTA

---

### POST 11
**Title**: Kitchen Renovation Planning in Melbourne: A Complete Step-by-Step Timeline  
**Slug**: `kitchen-renovation-planning-timeline-melbourne`  
**Category**: Renovation Planning  
**Tags**: `kitchen renovation`, `renovation planning`, `melbourne`, `renovation timeline`, `project management`  
**SEO Title**: Kitchen Renovation Timeline Melbourne | Planning Guide  
**SEO Description**: Planning a kitchen renovation in Melbourne? Follow our expert step-by-step timeline from budget to installation. Avoid costly mistakes with this complete guide.  
**Unsplash Keywords**: `kitchen renovation melbourne`, `home renovation planning`, `new kitchen design`  
**Key sections**:
- Phase 1: Planning & budgeting (weeks 1–2)
- Phase 2: Design & material selection (weeks 3–4)
- Phase 3: Getting quotes (weeks 5–6)
- Phase 4: Permits (if required)
- Phase 5: Demolition and preparation (weeks 7–8)
- Phase 6: Plumbing & electrical rough-in
- Phase 7: Cabinetry installation
- Phase 8: Stone benchtop template & fabrication (weeks 9–10)
- Phase 9: Stone installation
- Phase 10: Splashback & finishing touches
- Phase 11: Final inspection
- Common delays and how to avoid them
- What to ask your stonemason before signing
- Realistic timelines and budgets for Melbourne in 2026
- CTA

---

### POST 12
**Title**: Outdoor Kitchen Stone Guide: The Best Benchtop Materials for Australian Weather  
**Slug**: `outdoor-kitchen-stone-guide-australia`  
**Category**: Outdoor Living  
**Tags**: `outdoor kitchen`, `outdoor stone`, `alfresco benchtop`, `australia weather`, `BBQ area`  
**SEO Title**: Outdoor Kitchen Stone Guide Australia | Best Materials  
**SEO Description**: Not all stones suit outdoor kitchens. Discover which materials withstand Australian weather — UV, heat, rain and coastal conditions — for alfresco living.  
**Unsplash Keywords**: `outdoor kitchen australia`, `alfresco bbq area`, `outdoor stone benchtop`  
**Key sections**:
- Why outdoor kitchens need different stone consideration
- Australian climate challenges (UV, heat, rain, coastal salt)
- Best stone options for outdoors:
  - Granite (highly recommended for outdoor)
  - Porcelain (UV stable, the #1 outdoor choice)
  - Quartzite
  - Why marble is NOT recommended outdoors
  - Why quartz/CSF is NOT recommended outdoors (UV fading)
- Finish options for outdoor (honed/textured preferred for slip safety)
- Thickness recommendations (30mm+ for outdoor)
- Sealing requirements outdoors
- Design ideas for Melbourne alfresco entertaining areas
- Budget guide
- CTA

---

### POST 13
**Title**: Waterfall Edge Benchtops: The Ultimate Design Statement for Modern Australian Kitchens  
**Slug**: `waterfall-edge-benchtops-guide-australia`  
**Category**: Design & Trends  
**Tags**: `waterfall edge`, `benchtop design`, `kitchen island`, `luxury kitchen`, `modern design`  
**SEO Title**: Waterfall Edge Benchtops Australia | Design Guide  
**SEO Description**: Waterfall edge benchtops are the ultimate kitchen luxury statement. Learn about styles, materials, costs and installation for Australian homes in 2026.  
**Unsplash Keywords**: `waterfall kitchen island`, `marble waterfall benchtop`, `luxury kitchen island`  
**Key sections**:
- What is a waterfall edge benchtop?
- Why waterfall edges became so popular
- Best stones for waterfall edges (with matched veining)
- Single waterfall vs double waterfall
- Waterfall on island vs on runs
- The importance of matching slab veining
- How it's fabricated (mitre joint explained)
- Cost: how much extra is a waterfall edge?
- Maintenance considerations
- Real project examples from Melbourne
- Is a waterfall edge right for your kitchen?
- CTA

---

### POST 14
**Title**: The Best Stone Colours and Finishes for Small Kitchens in Australian Homes  
**Slug**: `best-stone-colours-small-kitchen-australia`  
**Category**: Design & Trends  
**Tags**: `small kitchen design`, `stone colours`, `light benchtop`, `kitchen design tips`, `australia`  
**SEO Title**: Best Stone Colours for Small Kitchens Australia 2026  
**SEO Description**: Make your small kitchen feel larger with the right stone colour and finish. Expert tips from Melbourne's stone specialists on colours that open up compact spaces.  
**Unsplash Keywords**: `small kitchen design`, `white kitchen compact`, `bright kitchen renovation`  
**Key sections**:
- How stone colour affects perceived space
- Best colours for small kitchens (white, cream, light grey, pale veined)
- Why veining patterns matter in small spaces
- Finishes that make spaces look larger (polished vs honed)
- Dark stones in small kitchens: can it work?
- Matching stone to cabinetry in tight spaces
- Thickness considerations (20mm keeps things lighter)
- Stone + splashback combinations for small kitchens
- Real examples from compact Melbourne apartments and townhouses
- Stones to avoid in small kitchens
- CTA

---

### POST 15
**Title**: Kitchen Splashback Ideas: Stone vs Tile vs Glass — Which is Best for Your Australian Home?  
**Slug**: `kitchen-splashback-ideas-stone-vs-tile-vs-glass`  
**Category**: Design & Trends  
**Tags**: `splashback ideas`, `kitchen splashback`, `stone splashback`, `tile vs glass`, `kitchen design`  
**SEO Title**: Kitchen Splashback Ideas: Stone vs Tile vs Glass  
**SEO Description**: Choosing a kitchen splashback? Compare stone, tile and glass splashbacks for Australian kitchens — cost, durability, style and what goes best with your benchtop.  
**Unsplash Keywords**: `kitchen splashback design`, `marble splashback kitchen`, `kitchen backsplash tile`  
**Key sections**:
- The role of a splashback in kitchen design
- Option 1: Stone splashback (matching or contrasting your benchtop)
  - Pros: continuity, luxury, seamless look
  - Cons: cost, grout lines if tiled format
- Option 2: Tile splashback
  - Pros: versatile, affordable, huge variety
  - Cons: grout maintenance, can look dated
- Option 3: Glass splashback
  - Pros: easy clean, seamless, any colour
  - Cons: scratches, not heat resistant near open flames
- Option 4: Porcelain panels (trending in 2026)
- How to match splashback to your benchtop stone
- Grout colour guide
- Budget comparison
- What our Melbourne customers are choosing in 2026
- CTA

---

## ⚙️ STEP 4 — SEED SCRIPT STRUCTURE

Create a file: `scripts/seed-blog.js` (or `.ts`)

```js
// Pseudocode structure
async function seedBlog() {
  console.log('🗑️  Deleting existing blog posts...');
  await deleteAllBlogPosts();
  
  console.log('📷 Fetching and uploading images to Cloudinary...');
  
  for (const post of BLOG_POSTS) {
    // 1. Fetch featured image from Unsplash
    const featuredImageUrl = await uploadToCloudinary(
      `https://source.unsplash.com/1600x900/?${post.unsplashKeyword}`
    );
    
    // 2. Fetch additional images (3-4 more)
    const additionalImages = await Promise.all(
      post.additionalKeywords.map(kw =>
        uploadToCloudinary(`https://source.unsplash.com/1200x800/?${kw}`)
      )
    );
    
    // 3. Build HTML content with embedded image URLs
    const htmlContent = buildPostContent(post, [featuredImageUrl, ...additionalImages]);
    
    // 4. Calculate read time
    const wordCount = htmlContent.replace(/<[^>]*>/g, '').split(' ').length;
    const readTime = Math.ceil(wordCount / 200);
    
    // 5. Insert into database
    await createBlogPost({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: htmlContent,
      featuredImage: featuredImageUrl,
      images: additionalImages,
      category: post.category,
      tags: post.tags,
      author: 'VPStoneMason Team',
      publishedAt: post.publishedAt,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      readTime: readTime,
    });
    
    console.log(`✅ Seeded: ${post.title}`);
  }
  
  console.log('🎉 Blog seeding complete! 15 posts created.');
}
```

---

## 📅 PUBLISHING DATES (staggered)

| Post # | Published At |
|--------|--------------|
| 1 | 2025-08-05 |
| 2 | 2025-08-12 |
| 3 | 2025-08-19 |
| 4 | 2025-08-26 |
| 5 | 2025-09-02 |
| 6 | 2025-09-09 |
| 7 | 2025-09-16 |
| 8 | 2025-09-23 |
| 9 | 2025-09-30 |
| 10 | 2025-10-07 |
| 11 | 2025-10-14 |
| 12 | 2025-10-21 |
| 13 | 2025-10-28 |
| 14 | 2025-11-04 |
| 15 | 2025-11-11 |

---

## ✅ FINAL CHECKLIST

After seeding, verify:

- [ ] All 15 posts exist in database
- [ ] Each post has a `featuredImage` (Cloudinary URL, not Unsplash direct URL)
- [ ] Each post has 3–5 images in `images[]` array
- [ ] All content is 1,500–2,500 words
- [ ] Slugs are unique and URL-safe
- [ ] `publishedAt` dates are staggered (not all the same)
- [ ] `readTime` is calculated correctly
- [ ] Old posts are deleted (run `COUNT(*)` to verify)
- [ ] Blog listing page shows all 15 posts
- [ ] Individual post pages render correctly with images
- [ ] SEO meta tags are pulling from `seoTitle` and `seoDescription`
- [ ] Images are loading correctly from Cloudinary (not Unsplash direct)

---

## 🚨 IMPORTANT NOTES

1. **Never link directly to Unsplash** in the final database — always upload to Cloudinary first
2. **Rate limiting**: Add a 500ms delay between Cloudinary uploads to avoid throttling
3. **Error handling**: If a Cloudinary upload fails, use a fallback stone image from your existing Cloudinary folder
4. **Content quality**: Do NOT write placeholder content — write full, genuine 1,500–2,500 word articles for each post
5. **Australian English**: Use AU spelling (colour, neighbour, organisation, recognise, etc.)
6. **Compliance**: Always mention that VPStoneMason is compliant with the July 2024 engineered stone ban when discussing engineered or CSF stone
7. **Internal links**: Where relevant, link between posts (e.g., "See our guide on edge profiles" → `/blog/stone-benchtop-edge-profiles-guide`)

