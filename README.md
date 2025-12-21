# LandSale.lk - Next.js with Appwrite

The Intelligent Real Estate Ecosystem for Sri Lanka, built with Next.js and powered by Appwrite.

## 🚀 Getting Started

This project follows the [Appwrite Next.js starter kit](https://github.com/appwrite/starter-for-nextjs) structure and best practices.

### Prerequisites

- Node.js 18.0 or later
- An Appwrite Cloud account or self-hosted Appwrite instance
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Appwrite**
   
   Create a `.env` file in the root of the `site` directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Appwrite project credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
   APPWRITE_API_KEY=your_api_key_here
   ```
   
   You can find these values in your [Appwrite Console](https://cloud.appwrite.io/):
   - **Endpoint**: Your Appwrite Cloud endpoint or self-hosted URL
   - **Project ID**: Found in Project Settings
   - **Database ID**: Found in your Database settings
   - **API Key**: Generate in Settings > API Keys (for server-side operations)

4. **Set up Appwrite Collections**
   
   Run the setup script to create required collections:
   ```bash
   node src/scripts/setup-collections.js
   ```
   
   Or manually configure your Appwrite project using the `appwrite.json` file.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

This project follows the Appwrite Next.js starter structure:

```
site/
├── public/                 # Static assets
│   ├── appwrite.svg
│   └── manifest.json
├── src/
│   ├── app/               # Next.js App Router pages and routes
│   │   ├── actions/       # Server actions
│   │   ├── admin/         # Admin pages
│   │   ├── agent/         # Agent pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # User dashboard
│   │   ├── properties/    # Property listing pages
│   │   └── ...
│   ├── components/        # React components
│   │   ├── admin/         # Admin components
│   │   ├── agent/         # Agent components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   ├── property/      # Property components
│   │   └── ...
│   ├── appwrite/          # Appwrite configuration and utilities
│   │   ├── appwrite.js    # Appwrite client initialization
│   │   ├── config.js      # Database/collection constants
│   │   ├── functions.js   # Appwrite Functions utilities
│   │   └── index.js       # Main exports
│   ├── lib/               # Other utility libraries
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   └── scripts/           # Setup and utility scripts
├── functions/             # Appwrite Cloud Functions
│   ├── check-subscription-expiry/
│   ├── expire-listings/
│   ├── generate-agent-id/
│   ├── generate-certificate/
│   ├── generate-pdf/
│   ├── send-email/
│   ├── send-otp-sms/
│   └── verify-otp/
├── appwrite.json          # Appwrite project configuration
├── next.config.mjs        # Next.js configuration
├── package.json           # Dependencies and scripts
└── .env.example           # Environment variables template
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📚 Key Features

- **Authentication**: Email/password, OAuth, Magic Link, OTP
- **Property Management**: Listings, search, favorites, saved searches
- **Agent System**: Agent registration, training, certificates, leads
- **Payment Integration**: PayHere payment gateway
- **Admin Dashboard**: User management, analytics, content management
- **Real Estate Tools**: Mortgage calculator, ROI calculator, property valuation
- **Legal Vault**: Secure document storage and management

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Your Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Your Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID` - Your Appwrite database ID
- `APPWRITE_API_KEY` - Server-side API key (never expose in client code)

## 🏗️ Appwrite Services Used

- **Databases**: Property listings, users, agents, transactions
- **Storage**: Images, documents, certificates
- **Authentication**: User management and authentication
- **Functions**: PDF generation, email sending, OTP verification
- **Avatars**: User profile images

## 📖 Documentation

- [Appwrite Documentation](https://appwrite.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Appwrite Next.js Quick Start](https://appwrite.io/docs/quick-starts/nextjs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [Appwrite](https://appwrite.io) and [Next.js](https://nextjs.org)

