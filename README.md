# 🏰 Landsale.lk

> **The Intelligent Real Estate Ecosystem for Sri Lanka**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Powered-fd366e?logo=appwrite)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Features

### For Buyers
- 🔍 **Smart Search** - Filter by Deed Type (Sinnakkara, Bim Saviya), Land Type, District
- 🤖 **AI Assistant** - 24/7 chatbot to qualify and connect with sellers
- 💰 **Financial Tools** - Mortgage calculator with live bank rates

### For Sellers
- 📝 **AI Listing Wizard** - Auto-generate descriptions & social media posts
- �️ **Uber-like Agent Finder** - See nearby agents on a live map
- ✅ **Trust Badges** - Verified Deed & Owner tags

### For Agents
- 📡 **Lead Radar** - Real-time notifications for buyer/seller leads
- 🎨 **Marketing Studio** - AI-powered flyer & post generator
- 📊 **CRM Dashboard** - Track leads from inquiry to closing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4 |
| **Backend** | Appwrite (Auth, Database, Storage, Functions) |
| **AI Engine** | OpenRouter (GPT-4o, Claude) |
| **Maps** | Google Maps API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Appwrite Cloud account (or self-hosted)

### Installation

```bash
# Clone the repository
git clone https://github.com/landsalelk/landsalelk.git
cd landsalelk

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Appwrite credentials

# Run development server
npm run dev
```

---

## � Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login, Register, KYC
│   ├── (dashboard)/        # User dashboards (Seller, Agent, Admin)
│   ├── property/           # Listing pages
│   └── api/                # Server routes (AI, webhooks)
├── components/
│   ├── ai/                 # Chat, Marketing Generator
│   ├── map/                # Agent Map, Property Pins
│   └── ui/                 # Design System
└── lib/
    ├── appwrite.ts         # Appwrite SDK setup
    └── ai-agent.ts         # OpenRouter integration
```

---

## 🇱🇰 Sri Lanka Specific

- **Deed Types**: Sinnakkara, Bim Saviya, Jayabhoomi, Swarnabhoomi
- **Land Units**: Perches, Roods, Acres (auto-conversion)
- **Languages**: Sinhala, Tamil, English
- **Approvals**: UDA, NBRO, Pradeshiya Sabha tracking

---

## 📄 License

MIT © [Landsale.lk](https://landsale.lk)