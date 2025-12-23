# Product Roadmap 🚀

This document outlines the planned improvements and future features for the LandSale.lk platform.

> **Last Updated:** December 22, 2025

---

## 📊 Progress Overview

| Category | Completed | In Progress | Planned |
|----------|-----------|-------------|---------|
| Core Platform | 4 | 1 | 3 |
| AI & Automation | 1 | 1 | 3 |
| Mobile Experience | 1 | 0 | 2 |
| Agent Tools | 2 | 0 | 2 |
| Security & Trust | 1 | 1 | 1 |
| Technical | 0 | 2 | 3 |

---

## 🌟 Core Platform Enhancements

- [x] **Property Listings** — Full CRUD with multi-image upload
- [x] **Search & Filters** — Category, location, price range filtering
- [x] **Owner Verification** — SMS-based verification flow
- [x] **Premium Listings** — Boost and featured listing support
- [/] **Auction System Implementation** — Enable real-time bidding for distress sales (Backend support exists, frontend in progress)
- [ ] **Advanced Map Search** — Polygon drawing search on maps for precise location filtering
- [ ] **Virtual Tours** — Integration with Matterport or simple 360-degree image viewer for listings
- [ ] **Multi-Language Support** — Full Sinhala and Tamil localization (currently English focused)

---

## 🤖 AI & Automation (LandSale Intelligence)

- [x] **Gamarala Chatbot** — Basic Q&A for real estate queries (Implemented)
- [/] **AI Property Valuation** — Enhanced valuation logic with market data
- [ ] **AI Property Description Generator** — Auto-generate descriptions from uploaded images and basic details
- [ ] **Price Prediction Model** — Enhance valuation logic with real historical transaction data
- [ ] **Smart Image Tagging** — Auto-categorize uploaded images (Kitchen, Bedroom, Garden) using AI

---

## 📱 Mobile Experience

- [x] **PWA Support** — Installable on mobile devices with offline capabilities
- [ ] **Native Mobile Apps** — React Native wrappers for iOS and Android stores
- [ ] **Push Notifications** — Enhanced mobile push notifications for saved searches and price drops

---

## 👨‍💼 Agent Tools

- [x] **Agent Dashboard** — Performance metrics and lead management
- [x] **Agent Certificate System** — Training completion certificates with QR verification
- [ ] **CRM Mobile App** — Dedicated simplified view for agents on the go
- [ ] **Automated Social Media Sharing** — One-click generation of Instagram/Facebook posts for new listings

---

## 🔒 Security & Trust

- [x] **Owner Verification** — SMS-based verification flow
- [/] **Two-Factor Authentication (2FA)** — Enforce 2FA for Agent and Admin accounts (Phone OTP implemented)
- [ ] **Blockchain Deed Verification** — (Long term) Integration with government land registry APIs if available

---

## 🛠 Technical Improvements

### DevOps & Quality (New — Phase 1)
- [x] **CI/CD Quality Gates** — Lint and build verification before deployment
- [/] **Branch Protection** — Required reviews and status checks
- [x] **Technical Debt Repayment** — Enabled strict TypeScript mode, removed hardcoded configuration, and improved security logging.
- [x] **Payment Function** — Implemented serverless payment processing logic.
- [ ] **Staging Environment** — Separate Appwrite project for pre-production testing
- [ ] **Automated Testing** — Playwright E2E tests in CI pipeline

### Performance & Optimization
- [ ] **Image Optimization Pipeline** — Move from client-side compression to server-side Appwrite Functions for better quality/size balance
- [ ] **Caching Layer** — Implement Redis or similar caching for heavy database queries (e.g., location searches)
- [ ] **Test Coverage** — Increase End-to-End test coverage with Playwright to 70%

---

## 🗓️ Quarterly Goals

### Q1 2026 (Jan - Mar)
| Goal | Status | Target Date |
|------|--------|-------------|
| Staging environment setup | 🔵 Planned | Jan 15 |
| E2E smoke tests in CI | 🔵 Planned | Jan 31 |
| Branch protection enabled | 🟡 In Progress | Jan 7 |
| Auction MVP launch | 🔵 Planned | Feb 28 |

### Q2 2026 (Apr - Jun)
| Goal | Status | Target Date |
|------|--------|-------------|
| Multi-language support (Sinhala) | 🔵 Planned | Apr 30 |
| Mobile push notifications | 🔵 Planned | May 31 |
| 40% test coverage | 🔵 Planned | Jun 30 |

---

## 📋 Legend

| Symbol | Meaning |
|--------|---------|
| `[x]` | Completed |
| `[/]` | In Progress |
| `[ ]` | Planned |

---

## 📝 Changelog

### December 2025
- Updated roadmap with current progress
- Added DevOps & Quality section
- Added quarterly goals with target dates
- Marked completed items from 2024

### October 2023
- Initial roadmap created
