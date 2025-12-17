# 🔴 Appwrite Realtime Implementation Guide

## Overview

This guide explains how to use the realtime subscriptions in your LandSale.lk application.

---

## ✅ What's Implemented

### Hooks Available (`src/hooks/useAppwriteRealtime.ts`)

| Hook | Purpose | Use Case |
|------|---------|----------|
| `useRealtimeCollection` | Generic collection subscription | Custom realtime needs |
| `useRealtimeListings` | New/updated listings | Homepage, search results |
| `useRealtimeNotifications` | User notifications | Navbar, dashboard |
| `useRealtimeChat` | Chat messages | AI chat, user messaging |
| `useRealtimeFavorites` | Favorite counts | Property cards |
| `useRealtimeListing` | Single listing updates | Property detail page |
| `useRealtimeOffers` | Bid/offer tracking | Auction properties |

### Components Available (`src/components/features/realtime/RealtimeComponents.tsx`)

| Component | Purpose |
|-----------|---------|
| `RealtimeNotificationToast` | Shows toast for new listings/notifications |
| `LiveFavoriteCount` | Live favorite counter |
| `LiveBidTracker` | Live bid/offer tracker |
| `RealtimeStatus` | Connection indicator |
| `NotificationBadge` | Unread count badge |

---

## 🚀 Quick Start

### 1. Add Realtime Toast to Layout

```tsx
// src/app/layout.tsx or src/app/(main)/layout.tsx

import { RealtimeNotificationToast } from '@/components/features/realtime/RealtimeComponents'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <RealtimeNotificationToast /> {/* Add this! */}
      </body>
    </html>
  )
}
```

### 2. Show Live Favorite Count on Property Cards

```tsx
// In your property card component

import { LiveFavoriteCount } from '@/components/features/realtime/RealtimeComponents'

function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <LiveFavoriteCount 
        listingId={property.$id} 
        initialCount={property.favorite_count || 0}
      />
    </div>
  )
}
```

### 3. Add Connection Status Indicator

```tsx
import { RealtimeStatus } from '@/components/features/realtime/RealtimeComponents'

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <RealtimeStatus /> {/* Shows 🟢 Live or 🔴 Connecting */}
    </nav>
  )
}
```

### 4. Add Notification Badge

```tsx
import { NotificationBadge } from '@/components/features/realtime/RealtimeComponents'
import { Bell } from 'lucide-react'

function NotificationIcon() {
  return (
    <button className="relative">
      <Bell className="w-6 h-6" />
      <NotificationBadge /> {/* Shows unread count */}
    </button>
  )
}
```

---

## 📝 Using Hooks Directly

### Subscribe to New Listings

```tsx
'use client'

import { useRealtimeListings } from '@/hooks/useAppwriteRealtime'

function NewListingsAlert() {
  const { listings, lastEvent, isConnected } = useRealtimeListings(
    // Callback for new listings
    (newListing) => {
      console.log('New listing:', newListing.title)
      // Play sound, show modal, etc.
    },
    // Callback for updated listings
    (updatedListing) => {
      console.log('Listing updated:', updatedListing.title)
    }
  )

  return (
    <div>
      {isConnected ? '🟢 Live' : '🔴 Offline'}
      {lastEvent && (
        <p>Last update: {lastEvent.timestamp.toLocaleTimeString()}</p>
      )}
    </div>
  )
}
```

### Subscribe to User Notifications

```tsx
'use client'

import { useRealtimeNotifications } from '@/hooks/useAppwriteRealtime'

function NotificationCenter({ userId }) {
  const { notifications, unreadCount, isConnected } = useRealtimeNotifications(userId)

  return (
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      <ul>
        {notifications.map(notif => (
          <li key={notif.$id}>
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Track Bids on Auction Property

```tsx
'use client'

import { useRealtimeOffers } from '@/hooks/useAppwriteRealtime'

function AuctionTracker({ listingId, startingPrice }) {
  const { offers, highestBid, lastOffer } = useRealtimeOffers(listingId)

  return (
    <div className="auction-panel">
      <div className="current-bid">
        <span>Current Bid:</span>
        <strong>LKR {(highestBid || startingPrice).toLocaleString()}</strong>
      </div>
      
      <div className="bid-count">
        {offers.length} bids placed
      </div>
      
      {lastOffer && (
        <div className="last-bid animate-pulse">
          New bid: LKR {lastOffer.offer_amount.toLocaleString()}
        </div>
      )}
    </div>
  )
}
```

### Generic Collection Subscription

```tsx
'use client'

import { useRealtimeCollection } from '@/hooks/useAppwriteRealtime'

function CustomRealtimeComponent() {
  const { documents, lastEvent, isConnected, error } = useRealtimeCollection(
    'my_collection',      // Collection ID
    undefined,            // Document ID (optional, undefined = all docs)
    (payload) => {        // Callback (optional)
      console.log('Event:', payload.event, payload.document)
    }
  )

  if (error) return <div>Error: {error}</div>
  if (!isConnected) return <div>Connecting...</div>

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.$id}>{doc.name}</div>
      ))}
    </div>
  )
}
```

---

## ⚡ Performance Tips

### 1. Only Subscribe When Needed
```tsx
// ❌ Don't subscribe at app root level for all collections
// ✅ Subscribe in specific components/pages

function PropertyDetailPage({ listingId }) {
  // Only subscribes for this specific listing
  const { listing } = useRealtimeListing(listingId)
}
```

### 2. Memoize Callbacks
```tsx
import { useCallback } from 'react'

function Component() {
  // ✅ Memoize to prevent re-subscriptions
  const handleNewListing = useCallback((listing) => {
    console.log('New:', listing)
  }, [])

  const { listings } = useRealtimeListings(handleNewListing)
}
```

### 3. Clean Up on Unmount
The hooks automatically clean up subscriptions when components unmount.

---

## 🔧 Troubleshooting

### "Not connected" or constant reconnecting

1. Check if Appwrite project ID is correct in `.env.local`
2. Verify the collection has the right permissions
3. Check browser console for WebSocket errors

### Events not firing

1. Make sure document permissions allow read access
2. Check if the collection name matches exactly
3. Verify the event type (create/update/delete)

### TypeScript errors

Add types for your documents:
```tsx
interface MyDocument {
  $id: string
  title: string
  // ... other fields
}

const { documents } = useRealtimeCollection<MyDocument>('my_collection')
```

---

## 📚 Resources

- [Appwrite Realtime Docs](https://appwrite.io/docs/apis/realtime)
- [Appwrite React Tutorial](https://appwrite.io/docs/tutorials/react)

---

*Last updated: December 2025*
