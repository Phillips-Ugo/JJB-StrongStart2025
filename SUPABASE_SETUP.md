# 🗄️ Supabase Integration Guide

## 🎯 Overview

All user data is now synced to Supabase for:
- **LLM-powered insights** generation
- **Pattern analysis** across users
- **Personalized recommendations** 
- **Data analytics** and reporting

---

## 📋 Database Setup

### **Step 1: Create Tables in Supabase**

1. Go to your Supabase dashboard: https://xxfuvulwhkwjmjzoojqw.supabase.co
2. Navigate to **SQL Editor**
3. Copy the entire contents of `src/services/databaseSchema.sql`
4. Paste and **Run** the SQL script

This creates 5 tables:
- ✅ `users` - Extension users
- ✅ `user_preferences` - Goals, budget, preferences
- ✅ `swipe_decisions` - All swipe training data
- ✅ `purchase_attempts` - Add to cart decisions
- ✅ `product_reviews` - User product reviews

---

## 📊 What Data Gets Stored

### **1. Users Table**
```sql
- id (UUID)
- extension_user_id (unique identifier)
- created_at, updated_at
```

### **2. User Preferences**
```sql
- goals (array): ['save-money', 'quality-first']
- goal_weights (JSON): {"save-money": 1.0, "quality-first": 1.0}
- price_sensitivity (JSON): {level: 'moderate', maxPrice: 150, willingToPayMore: true}
- category_preferences (JSON array): [{category: 'Electronics', interest: 'high', averagePricePoint: 45.50}]
```

### **3. Swipe Decisions** (Training Data)
```sql
- product_id: 'prod-123'
- product_data (JSON): {title, price, priceNumeric, category, rating, features}
- decision: 'like' or 'dislike'
- timestamp: 1699824000000
```

### **4. Purchase Attempts** (Add to Cart Events)
```sql
- product_id: 'B07PDHSPYD'
- product_data (JSON): Full product object
- recommendation: 'buy', 'consider', or 'skip'
- score: 0.75 (match score)
- user_decision: 'proceeded', 'cancelled', or 'viewed_alternative'
- alternative_selected: 'prod-alt-123' (if applicable)
- timestamp: 1699824000000
```

### **5. Product Reviews**
```sql
- product_id: 'B07PDHSPYD'
- product_data (JSON): Full product object
- rating: 1-5
- review_text: Optional user feedback
- would_recommend: true/false
```

---

## 🔄 Data Flow

### **During Onboarding:**
```
User completes step
  ↓
Save locally (Chrome storage)
  ↓
Sync to Supabase
  ↓
Available for LLM analysis
```

### **During Shopping:**
```
User clicks "Add to Cart"
  ↓
Analysis runs
  ↓
Modal shown
  ↓
User makes decision
  ↓
Tracked in Supabase
```

### **After Purchase:**
```
Product delivered (future)
  ↓
Prompt for review
  ↓
User rates product
  ↓
Review saved to Supabase
```

---

## 🤖 LLM Integration

### **Fetching Data for LLM:**

```typescript
import { SupabaseSync } from '@/services/supabaseSync'

// Get all user data formatted for LLM
const llmPrompt = await SupabaseSync.generateLLMPrompt()

// Send to OpenAI, Claude, or any LLM
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: llmPrompt
    }]
  })
})
```

### **Example LLM Prompt Generated:**

```
Analyze this user's shopping behavior and provide insights:

USER PREFERENCES:
- Goals: save-money, quality-first
- Budget Style: moderate
- Willing to pay more for quality: true

SWIPE TRAINING DATA (15 products):
Liked Products:
- Organic Cotton T-Shirt ($24.99) - Clothing
- Yoga Mat ($39.99) - Fitness
- Stainless Steel Water Bottle ($19.99) - Home

Disliked Products:
- Gaming Mouse ($44.99) - Gaming
- Smart Watch ($199.99) - Electronics

PURCHASE ATTEMPTS (3):
- Wireless Headphones ($89.99) - CONSIDER - User: viewed_alternative
- Coffee Maker ($49.99) - BUY - User: proceeded
- LED Lamp ($34.99) - BUY - User: proceeded

PRODUCT REVIEWS (1):
- Coffee Maker - Rating: 5/5 - Would recommend: true

Please provide:
1. Shopping personality analysis
2. Spending patterns and trends
3. Category preferences insights
4. Recommendations for better product matches
5. Potential savings opportunities
```

---

## 📈 Analytics Queries

### **Query 1: User Spending Patterns**
```sql
SELECT 
  p.price_sensitivity->>'level' as budget_style,
  COUNT(DISTINCT sd.product_id) as products_rated,
  AVG((sd.product_data->>'priceNumeric')::numeric) as avg_liked_price
FROM user_preferences p
LEFT JOIN swipe_decisions sd ON p.user_id = sd.user_id
WHERE sd.decision = 'like'
GROUP BY p.user_id, p.price_sensitivity;
```

### **Query 2: Conversion Tracking**
```sql
SELECT 
  recommendation,
  user_decision,
  COUNT(*) as count,
  ROUND(AVG(score), 2) as avg_score
FROM purchase_attempts
GROUP BY recommendation, user_decision
ORDER BY recommendation, user_decision;
```

### **Query 3: Most Liked Categories**
```sql
SELECT 
  product_data->>'category' as category,
  COUNT(*) as likes,
  AVG((product_data->>'priceNumeric')::numeric) as avg_price
FROM swipe_decisions
WHERE decision = 'like'
GROUP BY product_data->>'category'
ORDER BY likes DESC
LIMIT 10;
```

---

## 🎯 What Gets Synced & When

### **Immediate Sync (Real-time):**
- ✅ User preferences (after each step)
- ✅ Swipe decisions (as they happen)
- ✅ Purchase attempts (when modal shows)
- ✅ Product reviews (when submitted)

### **Bulk Sync:**
- ✅ All swipe decisions at end of onboarding
- ✅ Complete preference profile on completion

### **Error Handling:**
- ❌ If Supabase fails → Still saves locally
- ❌ Never blocks user experience
- ❌ Retry logic can be added

---

## 🔒 Security & Privacy

### **What's Protected:**
- ✅ Anonymous user IDs (no personal info)
- ✅ Row Level Security (RLS) enabled
- ✅ API keys in extension only
- ✅ No tracking across websites

### **Data Stored:**
- ✅ Shopping preferences
- ✅ Product interactions
- ✅ Purchase decisions
- ❌ NO personal information
- ❌ NO payment details
- ❌ NO browsing history

---

## 🤖 LLM Use Cases

### **1. Personalized Insights**
```
"Based on your 15 liked products, you prefer eco-friendly 
items under $40 in Home and Fitness categories. 
Consider checking out these sustainable brands..."
```

### **2. Spending Analysis**
```
"You typically spend $35-$50 per purchase. Your quality 
threshold is 4.5★. Products above $75 usually get skipped 
unless highly rated (4.8★+)."
```

### **3. Smart Recommendations**
```
"Users with similar preferences loved these products:
1. Bamboo Cutting Board ($28) - 4.9★
2. Reusable Produce Bags ($15) - 4.7★
3. Organic Coffee Beans ($23) - 4.8★"
```

### **4. Savings Report**
```
"By using our recommendations, you saved $127 across 8 
purchases last month. Average savings: $15.88 per item."
```

---

## 📊 Example Data in Supabase

### **User Preferences Table:**
| user_id | goals | price_sensitivity | updated_at |
|---------|-------|------------------|------------|
| user_123 | ['save-money', 'eco-friendly'] | {"level": "moderate", "maxPrice": 150} | 2024-11-12 |

### **Swipe Decisions Table:**
| user_id | product_id | decision | product_data | timestamp |
|---------|-----------|----------|--------------|-----------|
| user_123 | prod-2 | like | {"title": "Organic T-Shirt", "price": "$24.99"...} | 1699824000000 |
| user_123 | prod-8 | dislike | {"title": "Gaming Mouse", "price": "$44.99"...} | 1699824001000 |

### **Purchase Attempts Table:**
| user_id | product_id | recommendation | score | user_decision | alternative_selected |
|---------|-----------|----------------|-------|---------------|---------------------|
| user_123 | B07PDHSPYD | consider | 0.68 | viewed_alternative | alt-123 |
| user_123 | B08XYZ | buy | 0.85 | proceeded | null |

---

## 🚀 Implementation Status

### **✅ Completed:**
- [x] Supabase client configuration
- [x] Database schema (SQL file)
- [x] Sync service (SupabaseSync)
- [x] Storage integration
- [x] Onboarding data sync
- [x] Purchase tracking
- [x] Review system
- [x] LLM prompt generation

### **🎯 Ready to Use:**
All data automatically syncs to Supabase when:
- User completes onboarding goals
- User selects price sensitivity
- User swipes products
- User clicks "Add to Cart"
- User submits reviews

---

## 🔧 Testing

### **Verify Sync is Working:**

1. **Complete onboarding** in the extension
2. **Go to Supabase dashboard**
3. **Open Table Editor**
4. **Check tables:**
   - `users` - Should have 1 row with your user_id
   - `user_preferences` - Should have your goals and budget
   - `swipe_decisions` - Should have 10-50 entries
   - `purchase_attempts` - Empty until you click "Add to Cart"

### **Console Logs:**
Look for these messages in browser console:
- ✅ "Preferences synced to Supabase"
- ✅ "Swipe decision synced to Supabase"
- ✅ "X swipe decisions synced to Supabase"
- ✅ "Purchase attempt tracked in Supabase"

---

## 💡 Advanced Usage

### **Query User Insights:**
```typescript
import { SupabaseSync } from '@/services/supabaseSync'

// Get complete user data
const data = await SupabaseSync.fetchUserDataForLLM()

console.log('Total data points:', data.totalDataPoints)
console.log('Liked products:', data.swipeDecisions.filter(d => d.decision === 'like'))
```

### **Generate LLM Analysis:**
```typescript
const prompt = await SupabaseSync.generateLLMPrompt()

// Send to your preferred LLM
const insights = await callLLM(prompt)

// Display to user
showInsights(insights)
```

---

## 📁 Files Created

1. **`src/config/supabase.ts`** - Supabase client and types
2. **`src/services/supabaseSync.ts`** - Sync service with all methods
3. **`src/services/databaseSchema.sql`** - Complete database schema
4. **`src/components/ReviewPrompt.tsx`** - Product review UI
5. **`src/components/ReviewPrompt.css`** - Review styles
6. **`SUPABASE_SETUP.md`** - This guide

### **Modified Files:**
- `src/utils/storage.ts` - Added Supabase sync calls
- `src/content/cartInterceptor.ts` - Track purchase decisions
- `src/content/purchaseModal.ts` - Handle alternative clicks
- `src/components/onboarding/OnboardingFlow.tsx` - Bulk sync swipes

---

## 🎉 Benefits

### **For Users:**
- 💰 Better recommendations over time
- 🎯 Personalized insights
- 📊 Spending analytics
- 🤖 AI-powered shopping advice

### **For You:**
- 📈 Rich analytics data
- 🤖 LLM-ready format
- 📊 User behavior insights
- 💡 Product performance tracking

---

## 🚀 Next Steps

### **1. Setup Database:**
```bash
1. Open Supabase SQL Editor
2. Paste contents of databaseSchema.sql
3. Run the script
4. Verify tables created
```

### **2. Test Integration:**
```bash
1. Rebuild extension: npm run dev
2. Reload in Chrome
3. Complete onboarding
4. Check Supabase tables
5. See data appear!
```

### **3. Use LLM:**
```typescript
// Generate insights
const prompt = await SupabaseSync.generateLLMPrompt()
const insights = await yourLLM.generate(prompt)
// Show to user
```

---

## 📊 Expected Data Volume

### **Per User:**
- 1 preference record
- 10-50 swipe decisions
- 1-10 purchase attempts per week
- 0-5 reviews per month

### **Total Data Points:**
- Minimum: 11 (1 pref + 10 swipes)
- Average: 30-40 data points
- Active users: 50-100+ data points

---

## 🔐 API Keys

**Project URL:** https://xxfuvulwhkwjmjzoojqw.supabase.co  
**Anon Key:** (Already configured in `src/config/supabase.ts`)

**Security Notes:**
- ✅ Using anon key (safe for client-side)
- ✅ RLS policies configured
- ✅ No sensitive data exposed
- ✅ Read/write permissions controlled

---

## 💡 LLM Prompt Examples

### **Shopping Personality:**
```
"Analyze this user's shopping personality based on 
their preferences and purchase history."
```

### **Savings Opportunities:**
```
"Based on liked products, recommend 5 similar items 
that are 20-30% cheaper but maintain quality."
```

### **Category Expansion:**
```
"User likes Home and Fitness. Suggest 3 new categories 
they might enjoy based on their preferences."
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database tables created (run SQL script)
- [ ] Extension rebuilt with Supabase integration
- [ ] Completed onboarding in extension
- [ ] Verified data in Supabase tables
- [ ] Console shows "✅ synced to Supabase" messages
- [ ] Tested LLM prompt generation
- [ ] No errors in browser console

---

**Your extension now stores rich data for LLM-powered insights!** 🎉

Made with ❤️ for intelligent shopping recommendations

