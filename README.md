# LandSale.lk 🏠

The Intelligent Real Estate Ecosystem for Sri Lanka. Built with **Next.js 15**, **Tailwind CSS v4**, and **Appwrite**.

## 🚀 Overview

LandSale.lk is a modern, full-stack real estate platform designed to streamline property buying, selling, and renting in Sri Lanka. It features an advanced Agent system, Owner Verification flows, AI-powered assistance, and secure document handling.

### Key Features
*   **🏢 Advanced Listings**: Buy, Rent, and "Wanted" listings with detailed attributes.
*   **🤖 AI Assistant (Gamarala)**: Integrated AI chatbot for real estate queries and guidance.
*   **✅ Owner Verification**: SMS-based verification loop to ensure listing authenticity.
*   **👨‍💼 Agent Ecosystem**: Gamified agent system with training, certificates, and lead management.
*   **📄 Legal Vault**: Secure storage for property deeds and legal documents.
*   **💰 ROI Calculator**: Investment analysis tools tailored to Sri Lankan market rates.
*   **📱 PWA Ready**: Installable on mobile devices with offline capabilities.

## 🛠 Tech Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Framer Motion
*   **Styling**: Tailwind CSS v4 (using CSS variables and `@theme`)
*   **Backend**: Appwrite Cloud (Database, Auth, Storage, Functions)
*   **Icons**: Lucide React
*   **Maps**: Leaflet / React-Leaflet
*   **Payments**: PayHere Integration

## 🏁 Getting Started

### Prerequisites
*   Node.js 18.0 or later
*   Appwrite Cloud Account (or self-hosted instance)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/landsalelk/landsalelk.git
    cd landsalelk
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```
    *Note: If you are on Linux, ensure `lightningcss-linux-x64-musl` is installed for Tailwind v4 compatibility.*

3.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in your Appwrite credentials:
    ```bash
    cp .env.example .env
    ```

    Required variables:
    ```env
    NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
    NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
    APPWRITE_API_KEY=your_server_api_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```
.
├── src/
│   ├── app/            # Next.js App Router (Pages & API)
│   ├── components/     # Reusable React Components
│   ├── lib/            # Utilities & Appwrite Config
│   └── actions/        # Server Actions
├── functions/          # Appwrite Cloud Functions
│   ├── generate-agent-id/
│   ├── send-otp-sms/
│   └── ...
├── appwrite.json       # Appwrite Project Configuration
├── AGENTS.md           # Coding Standards & AI Instructions
├── DEPLOYMENT.md       # Deployment Guide
└── ROADMAP.md          # Future Plans
```

## ☁️ Appwrite Integration

This project relies heavily on Appwrite Services:

*   **Database**: Stores Listings, Users, Agents, and Transactions.
*   **Storage**: Property images and Legal Vault documents.
*   **Functions**: Server-side logic for PDF generation, SMS notifications, and background tasks.

**Note**: The project is configured for the **Singapore (sgp)** region. Ensure your Appwrite project is in the same region or update `NEXT_PUBLIC_APPWRITE_ENDPOINT`.

## 🤝 Contributing

See `ROADMAP.md` for planned features.

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
