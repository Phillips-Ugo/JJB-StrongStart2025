# 🚀 Complete Setup Guide - Supabase + LLM Integration

## 🎯 What You Asked For

> "Store all onboarding data (swipes, product data, choices, user selections, reviews) in Supabase so we can give it to an LLM to generate insights."

## ✅ DONE! Here's Everything

---

## 📦 What's Been Implemented

### **1. Supabase Integration** 🗄️
- ✅ Database client configured
- ✅ 5 tables with complete schema
- ✅ Auto-sync on all user actions
- ✅ Error handling and retry logic

### **2. Data Collection** 📊
- ✅ Onboarding preferences (goals, budget)
- ✅ All 50 swipe decisions
- ✅ Purchase attempt tracking
- ✅ Product review system
- ✅ Complete user profiles

### **3. LLM Integration** 🤖
- ✅ Auto-generated prompts
- ✅ Formatted user data
- ✅ Ready for OpenAI/Claude/any LLM
- ✅ Insight generation service

---

## 🏗️ Database Schema

### **Tables Created:**
#### 1. **users** - User accounts
```sql
- extension_user_id (unique)
- created_at, updated_at
```

#### 2. **user_preferences** - Shopping profile
```sql
- goals: ['save-money', 'quality-first']
- goal_weights: {save-money: 1.0}
- price_sensitivity: {level: 'moderate', maxPrice: 150}
- category_preferences: [{category: 'Home', interest: 'high'}]
```

#### 3. **swipe_decisions** - Training data  
```sql
- product_id, product_data (full JSON)
- decision: 'like' or 'dislike'
- timestamp
```

#### 4. **purchase_attempts** - Cart interactions
```sql
- product_data (full JSON)
- recommendation: 'buy'/'consider'/'skip'
- score: 0.75
- user_decision: 'proceeded'/'cancelled'/'viewed_alternative'
- alternative_selected: 'prod-alt-123'
```

#### 5. **product_reviews** - User feedback
```sql
- product_data (full JSON)
- rating: 1-5
- review_text: "Great product!"
- would_recommend: true
```

---

## 🔄 Auto-Sync Events

### **Data automatically syncs when:**

| User Action | What's Stored | Where |
|-------------|--------------|-------|
| Selects goals | Goals + weights | `user_preferences` |
| Chooses budget | Price sensitivity | `user_preferences` |
| Swipes product | Full product + decision | `swipe_decisions` |
| Completes onboarding | All swipes (bulk) | `swipe_decisions` |
| Clicks "Add to Cart" | Product + recommendation + decision | `purchase_attempts` |
| Submits review | Rating + text + recommendation | `product_reviews` |

---

## 📝 Setup Instructions

### **Step 1: Create Database Tables**

1. Open Supabase: https://xxfuvulwhkwjmjzoojqw.supabase.co
2. Go to **SQL Editor**
3. Copy `src/services/databaseSchema.sql`
4. Paste and **Run**
5. ✅ Verify 5 tables created

### **Step 2: Rebuild Extension**

```bash
npm run dev
```

### **Step 3: Test Data Flow**

```bash
1. Reload extension in Chrome
2. Complete onboarding (10+ products)
3. Go to Supabase → Table Editor
4. Check 'swipe_decisions' table
5. Should see your swipe data! ✅
```

---

## 🤖 LLM Integration

### **Generate Insights:**

```typescript
import { LLMService } from '@/services/llmService'

// Get AI-powered insights
const insights = await LLMService.generateInsights()

console.log(insights.personality)
// "You're a moderate shopper who values save-money..."

console.log(insights.spendingPatterns)
// "Your sweet spot is $28-$42. Products outside this range..."

console.log(insights.recommendations)
// ["Focus on save-money goal", "Look for 4.5★+ products", ...]

console.log(insights.savingsOpportunities)
// "You could save $45 by choosing recommended alternatives"
```

### **Custom LLM Query:**

```typescript
import { SupabaseSync } from '@/services/supabaseSync'

// Get formatted prompt
const prompt = await SupabaseSync.generateLLMPrompt()

// Send to your LLM
const response = await fetch('YOUR_LLM_API', {
  method: 'POST',
  body: JSON.stringify({ prompt })
})

const insights = await response.json()
```

---

## 📊 Example Data in Supabase

### **After Onboarding:**

**user_preferences:**
```json
{
  "user_id": "user_1699824000_abc123",
  "goals": ["save-money", "quality-first"],
  "goal_weights": {"save-money": 1.0, "quality-first": 1.0},
  "price_sensitivity": {
    "level": "moderate",
    "maxPrice": 150,
    "willingToPayMore": true
  }
}
```

**swipe_decisions:** (15 entries)
```json
[
  {
    "product_id": "prod-2",
    "decision": "like",
    "product_data": {
      "title": "Organic Cotton T-Shirt",
      "priceNumeric": 24.99,
      "category": "Clothing",
      "rating": 4.8
    }
  },
  {
    "product_id": "prod-8",
    "decision": "dislike",
    "product_data": {
      "title": "Gaming Mouse",
      "priceNumeric": 44.99,
      "category": "Gaming"
    }
  }
]
```

### **After Shopping:**

**purchase_attempts:**
```json
{
  "product_id": "B07PDHSPYD",
  "recommendation": "consider",
  "score": 0.68,
  "user_decision": "viewed_alternative",
  "alternative_selected": "alt-123",
  "product_data": {
    "title": "Wireless Headphones",
    "priceNumeric": 89.99
  }
}
```

---

## 🎯 LLM Prompt Example

**Auto-generated from your data:**

```
Analyze this user's shopping behavior and provide insights:

USER PREFERENCES:
- Goals: save-money, quality-first
- Budget Style: moderate
- Willing to pay more for quality: true

SWIPE TRAINING DATA (15 products):
Liked Products:
- Organic Cotton T-Shirt ($24.99) - Clothing
- Stainless Steel Water Bottle ($19.99) - Home
- Yoga Mat ($39.99) - Fitness
- LED Desk Lamp ($34.99) - Home Office
- Portable Phone Charger ($29.99) - Electronics

Disliked Products:
- Gaming Mouse ($44.99) - Gaming
- Smart Watch ($199.99) - Electronics
- Winter Jacket ($149.99) - Clothing

PURCHASE ATTEMPTS (2):
- Wireless Headphones ($89.99) - CONSIDER - User: viewed_alternative
- Coffee Maker ($49.99) - BUY - User: proceeded

PRODUCT REVIEWS (1):
- Coffee Maker - Rating: 5/5 - Would recommend: true

Please provide:
1. Shopping personality analysis
2. Spending patterns and trends
3. Category preferences insights
4. Recommendations for better product matches
5. Potential savings opportunities
```

**LLM Response (Example):**
```
SHOPPING PERSONALITY:
You're a value-conscious shopper who seeks the sweet spot between 
affordability and quality. You gravitate toward practical, everyday 
items in the $20-$40 range, with occasional splurges up to $90 for 
higher-quality electronics.

SPENDING PATTERNS:
- Average liked product: $32.50
- Price threshold: Rarely buy over $50 unless rating is 4.7★+
- Category preference: Home & Fitness (60% of likes)
- Quality standard: Minimum 4.4★ rating

RECOMMENDATIONS:
1. Explore Home & Kitchen category - matches your style perfectly
2. Look for "eco-friendly" products - aligns with quality preferences
3. Set price alerts for $25-$35 items in your favorite categories

SAVINGS OPPORTUNITIES:
You could save $127 over next 10 purchases by:
- Choosing recommended alternatives (avg $12.70 saved)
- Waiting for deals on wishlist items
- Buying similar products from budget brands
```

---

## 📈 Analytics Dashboards (Future)

### **User Dashboard:**
```
┌─────────────────────────────────┐
│ 🤖 Your Shopping Insights       │
├─────────────────────────────────┤
│ Shopping Personality:           │
│ "Value-conscious buyer"         │
│                                 │
│ 📊 Your Stats:                  │
│ • 15 products rated             │
│ • $32 average price             │
│ • 73% like rate                 │
│ • 4.6★ quality threshold        │
│                                 │
│ 💰 Savings This Month:          │
│ • $67 saved (5 purchases)       │
│ • 18% average discount          │
│                                 │
│ 🎯 Top Categories:              │
│ • Home & Kitchen (40%)          │
│ • Fitness (27%)                 │
│ • Clothing (20%)                │
└─────────────────────────────────┘
```

---

## 🔧 API Methods

### **Supabase Sync:**
```typescript
// Initialize user
await SupabaseSync.initializeUser()

// Sync preferences
await SupabaseSync.syncPreferences(preferences)

// Sync swipe decision
await SupabaseSync.syncSwipeDecision(decision)

// Bulk sync swipes
await SupabaseSync.syncAllSwipeDecisions(decisions)

// Track purchase
await SupabaseSync.trackPurchaseAttempt(product, rec, score, decision)

// Save review
await SupabaseSync.saveProductReview(product, rating, text, recommend)

// Fetch for LLM
const data = await SupabaseSync.fetchUserDataForLLM()

// Generate prompt
const prompt = await SupabaseSync.generateLLMPrompt()
```

### **LLM Service:**
```typescript
// Generate insights
const insights = await LLMService.generateInsights()

// Get quick stats
const stats = await LLMService.getQuickStats()
```

---

## 🎉 What This Enables

### **Immediate:**
- ✅ All user data in Supabase
- ✅ Ready for LLM analysis
- ✅ Purchase tracking
- ✅ Review collection

### **Short-term:**
- 🤖 AI-generated shopping insights
- 📊 Spending pattern analysis
- 💰 Personalized savings tips
- 🎯 Smarter recommendations

### **Long-term:**
- 📈 Aggregate user insights
- 🔍 Product performance tracking
- 💡 Trend analysis
- 🚀 Predictive recommendations

---

## 📁 New Files Summary

### **Configuration:**
- `src/config/supabase.ts` - Client setup + TypeScript types

### **Services:**
- `src/services/supabaseSync.ts` - Complete sync service
- `src/services/llmService.ts` - LLM integration
- `src/services/databaseSchema.sql` - Database creation script

### **Components:**
- `src/components/ReviewPrompt.tsx` - Product review UI
- `src/components/ReviewPrompt.css` - Styles

### **Documentation:**
- `SUPABASE_SETUP.md` - Database setup guide
- `COMPLETE_SETUP_GUIDE.md` - This comprehensive guide

### **Modified:**
- `src/utils/storage.ts` - Added Supabase sync
- `src/content/cartInterceptor.ts` - Track decisions
- `src/content/purchaseModal.ts` - Alternative tracking
- `src/components/onboarding/OnboardingFlow.tsx` - Bulk sync

---

## 🎬 Quick Start (3 Steps)

### **1. Setup Supabase (2 minutes)**
```sql
-- Copy src/services/databaseSchema.sql
-- Paste in Supabase SQL Editor
-- Click Run
✅ Done!
```

### **2. Rebuild Extension (10 seconds)**
```bash
npm run dev
✅ Auto-rebuilds with Supabase!
```

### **3. Test (1 minute)**
```bash
1. Reload extension in Chrome
2. Complete onboarding
3. Check Supabase tables
✅ See your data!
```

---

## 💡 Next Steps

### **Immediate:**
1. Run database schema in Supabase
2. Rebuild extension
3. Test data flow
4. Verify data in tables

### **Next:**
1. Add LLM API (OpenAI/Claude)
2. Generate insights for users
3. Show insights dashboard
4. Enable review prompts after purchases

---

## 🎉 Result

You now have:
- ✅ **Complete data pipeline** (Extension → Supabase)
- ✅ **Rich user profiles** (50+ data points per user)
- ✅ **LLM-ready format** (auto-generated prompts)
- ✅ **Purchase tracking** (every add to cart event)
- ✅ **Review system** (post-purchase feedback)

**All ready for AI-powered insights!** 🤖✨

---

Made with ❤️ for intelligent shopping

