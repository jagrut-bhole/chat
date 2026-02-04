# Complete Architecture for Location-Based Chat App

## **1. Technology Stack**

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** (for styling)
- **Zustand** or **React Context** (state management)
- **Socket.io-client** (WebSocket client)

### Backend
- **Next.js API Routes** (REST APIs)
- **Socket.io** (WebSocket server)
- **Node.js** (separate WebSocket server or integrated)

### Database
- **PostgreSQL** (main database)
- **Prisma ORM** (database access)
- **Redis** (optional but recommended - for session storage, matching queue, caching)

### Storage & Services
- **AWS S3 / Cloudflare R2 / UploadThing** (file storage)
- **NextAuth.js** or **Clerk** (authentication)

### DevOps
- **Vercel** (Next.js hosting) or **Railway/Render**
- **Separate server** for WebSocket (if needed)

---

## **2. Database Schema**

```prisma
// User model
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  username      String   @unique
  passwordHash  String
  latitude      Float?
  longitude     Float?
  lastLocation  DateTime?
  isOnline      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  groupMemberships  GroupMember[]
  groupMessages     GroupMessage[]
  privateChatsAsUser1  PrivateChat[] @relation("User1Chats")
  privateChatsAsUser2  PrivateChat[] @relation("User2Chats")
  privateMessages   PrivateMessage[]
}

// Location-based group
model Group {
  id          String   @id @default(cuid())
  name        String   // Auto-generated like "Group #1234"
  latitude    Float
  longitude   Float
  radius      Float    // in kilometers
  maxMembers  Int      @default(50)
  expiresAt   DateTime // Auto-delete time
  createdAt   DateTime @default(now())
  
  members     GroupMember[]
  messages    GroupMessage[]
  
  @@index([latitude, longitude])
  @@index([expiresAt])
}

model GroupMember {
  id        String   @id @default(cuid())
  userId    String
  groupId   String
  joinedAt  DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  @@unique([userId, groupId])
  @@index([groupId])
}

model GroupMessage {
  id          String   @id @default(cuid())
  groupId     String
  userId      String
  content     String?
  mediaUrl    String?  // Image URL if photo uploaded
  mediaType   String?  // 'image', 'gif', etc.
  createdAt   DateTime @default(now())
  
  group       Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([groupId, createdAt])
}

// Random 1-on-1 chat
model PrivateChat {
  id          String   @id @default(cuid())
  user1Id     String
  user2Id     String
  status      String   @default("active") // active, ended
  createdAt   DateTime @default(now())
  endedAt     DateTime?
  
  user1       User     @relation("User1Chats", fields: [user1Id], references: [id], onDelete: Cascade)
  user2       User     @relation("User2Chats", fields: [user2Id], references: [id], onDelete: Cascade)
  messages    PrivateMessage[]
  
  @@index([user1Id, user2Id])
  @@index([status])
}

model PrivateMessage {
  id          String   @id @default(cuid())
  chatId      String
  senderId    String
  content     String?
  mediaUrl    String?
  mediaType   String?
  createdAt   DateTime @default(now())
  
  chat        PrivateChat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender      User        @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  @@index([chatId, createdAt])
}
```

---

## **3. System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React Components)          │   │
│  │  - Authentication UI                                 │   │
│  │  - Group Discovery & Chat                            │   │
│  │  - Random Chat (Omegle-style)                        │   │
│  │  - File Upload UI                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                    │             │
│           │ HTTP/REST                          │ WebSocket   │
│           ▼                                    ▼             │
└───────────────────────────────────────────────────────────────┘
            │                                    │
            │                                    │
┌───────────▼────────────────────────────────────▼─────────────┐
│                         SERVER                                │
│  ┌────────────────────────┐    ┌──────────────────────────┐  │
│  │   Next.js API Routes   │    │   Socket.io Server       │  │
│  │  - /api/auth/*         │    │  - Real-time messaging   │  │
│  │  - /api/groups/*       │    │  - Typing indicators     │  │
│  │  - /api/messages/*     │    │  - User matching         │  │
│  │  - /api/upload         │    │  - Online status         │  │
│  │  - /api/random-chat/*  │    │  - Room management       │  │
│  └────────────────────────┘    └──────────────────────────┘  │
│           │                                    │              │
│           ▼                                    ▼              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Business Logic Layer                    │    │
│  │  - LocationService (geospatial calculations)         │    │
│  │  - MatchingService (random user pairing)             │    │
│  │  - GroupService (group CRUD, auto-deletion)          │    │
│  │  - MessageService (message handling)                 │    │
│  │  - UploadService (file processing)                   │    │
│  └──────────────────────────────────────────────────────┘    │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Data Access Layer                       │    │
│  │              Prisma ORM                              │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
┌────────────────────┐      ┌──────────────────────┐
│    PostgreSQL      │      │      Redis           │
│  - Users           │      │  - Matching Queue    │
│  - Groups          │      │  - Online Users      │
│  - Messages        │      │  - Session Store     │
│  - Chats           │      │  - Rate Limiting     │
└────────────────────┘      └──────────────────────┘

            │
            ▼
┌────────────────────┐
│   Cloud Storage    │
│  (S3/R2/UploadThing)│
│  - User uploads    │
│  - Images/Media    │
└────────────────────┘

            │
            ▼
┌────────────────────┐
│   Cron Jobs        │
│  - Delete expired  │
│    groups          │
│  - Cleanup old     │
│    messages        │
└────────────────────┘
```

---

## **4. API Endpoints Structure**

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
PATCH  /api/auth/location (update user location)
```

### Groups (Location-based)
```
GET    /api/groups?lat={lat}&lng={lng}&radius={radius}
POST   /api/groups (create new group)
GET    /api/groups/:id
POST   /api/groups/:id/join
POST   /api/groups/:id/leave
GET    /api/groups/:id/messages?cursor={cursor}&limit={limit}
POST   /api/groups/:id/messages
DELETE /api/groups/:id (admin only)
```

### Random Chat (Omegle-style)
```
POST   /api/random/start (join matching queue)
POST   /api/random/skip (skip current partner)
POST   /api/random/end (end current chat)
GET    /api/random/active (get current active chat)
GET    /api/random/messages/:chatId
POST   /api/random/messages/:chatId
```

### File Upload
```
POST   /api/upload (upload image/media)
```

---

## **5. WebSocket Events**

### Client → Server
```javascript
// Connection
connect
disconnect
authenticate

// Group Chat
join_group { groupId }
leave_group { groupId }
send_group_message { groupId, content, mediaUrl }
typing_group { groupId, isTyping }

// Random Chat
join_random_queue
skip_partner
end_random_chat
send_private_message { chatId, content, mediaUrl }
typing_private { chatId, isTyping }
```

### Server → Client
```javascript
// Connection
authenticated
error

// Group Chat
group_message { groupId, message, user }
user_joined_group { groupId, user }
user_left_group { groupId, userId }
typing_indicator_group { groupId, userId, isTyping }

// Random Chat
match_found { chatId, partnerId }
partner_skipped
partner_disconnected
private_message { chatId, message, senderId }
typing_indicator_private { chatId, isTyping }
```

---

## **6. Core Services/Modules**

### **LocationService**
```typescript
class LocationService {
  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2): number
  
  // Find groups within radius
  findNearbyGroups(userLat, userLng, radius): Promise<Group[]>
  
  // Create location-based group
  createLocationGroup(lat, lng, radius, expiresIn): Promise<Group>
}
```

### **MatchingService**
```typescript
class MatchingService {
  // Add user to matching queue
  addToQueue(userId): void
  
  // Find match for user
  findMatch(userId): Promise<User | null>
  
  // Remove user from queue
  removeFromQueue(userId): void
  
  // Create private chat between matched users
  createPrivateChat(user1Id, user2Id): Promise<PrivateChat>
}
```

### **GroupService**
```typescript
class GroupService {
  // CRUD operations
  createGroup(data): Promise<Group>
  getGroup(groupId): Promise<Group>
  deleteGroup(groupId): Promise<void>
  
  // Membership
  joinGroup(userId, groupId): Promise<void>
  leaveGroup(userId, groupId): Promise<void>
  
  // Messages
  sendMessage(groupId, userId, content, mediaUrl): Promise<Message>
  getMessages(groupId, cursor, limit): Promise<Message[]>
  
  // Auto-deletion
  deleteExpiredGroups(): Promise<void>
}
```

### **UploadService**
```typescript
class UploadService {
  // Upload file to cloud storage
  uploadFile(file, userId): Promise<string> // returns URL
  
  // Validate file (size, type)
  validateFile(file): boolean
  
  // Delete file
  deleteFile(url): Promise<void>
}
```

---

## **7. Frontend Structure**

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (main)/
│   ├── groups/
│   │   ├── page.tsx              # Browse groups
│   │   └── [id]/
│   │       └── page.tsx          # Group chat
│   ├── random/
│   │   └── page.tsx              # Random chat
│   └── layout.tsx                # Main layout with auth
├── api/
│   ├── auth/
│   ├── groups/
│   ├── random/
│   └── upload/
└── layout.tsx

components/
├── chat/
│   ├── ChatWindow.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   ├── TypingIndicator.tsx
│   └── FileUpload.tsx
├── groups/
│   ├── GroupList.tsx
│   ├── GroupCard.tsx
│   └── CreateGroupModal.tsx
├── random/
│   ├── MatchingScreen.tsx
│   ├── RandomChatWindow.tsx
│   └── SkipButton.tsx
└── shared/
    ├── Header.tsx
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx

lib/
├── prisma.ts                     # Prisma client
├── socket.ts                     # Socket.io client setup
├── auth.ts                       # Auth utilities
└── services/
    ├── locationService.ts
    ├── matchingService.ts
    ├── groupService.ts
    └── uploadService.ts

hooks/
├── useSocket.ts
├── useChat.ts
├── useLocation.ts
└── useFileUpload.ts

store/
└── chatStore.ts                  # Zustand store
```

---

## **8. Key Algorithms**

### **Geospatial Distance Calculation**
```
Haversine Formula:
- Calculate distance between two lat/lng coordinates
- Filter groups within specified radius
- Can be done in PostgreSQL or application code
```

### **Random Matching Algorithm**
```
1. User clicks "Search"
2. Add user to Redis queue: LPUSH matching_queue userId
3. Check if another user in queue: RPOP matching_queue
4. If found:
   - Create PrivateChat in DB
   - Emit match_found to both users
   - Remove both from queue
5. If not found:
   - Keep user in queue
   - Set timeout (e.g., 30s) to retry
```

### **Auto-Deletion System**
```
Cron job runs every 5 minutes:
1. Query groups where expiresAt < now()
2. Delete associated messages
3. Delete group members
4. Delete group
5. Notify connected users via WebSocket
```

---

## **9. Data Flow Examples**

### **Scenario 1: User Joins Group**
```
1. User opens /groups page
2. Frontend calls GET /api/groups?lat=X&lng=Y&radius=5
3. Backend calculates nearby groups using LocationService
4. Frontend displays group list
5. User clicks "Join Group"
6. Frontend calls POST /api/groups/:id/join
7. Backend adds GroupMember record
8. Frontend connects to Socket.io
9. Frontend emits join_group { groupId }
10. Server adds user to Socket.io room
11. Server broadcasts user_joined_group to all members
```

### **Scenario 2: Random Chat**
```
1. User clicks "Find Random Chat"
2. Frontend calls POST /api/random/start
3. Backend adds user to matching queue (Redis)
4. MatchingService finds another waiting user
5. Backend creates PrivateChat record
6. Server emits match_found to both users
7. Frontend navigates to chat interface
8. Users exchange messages via WebSocket
9. User clicks "Skip"
10. Frontend emits skip_partner
11. Backend ends current chat, adds user back to queue
12. Server emits partner_skipped to other user
```

### **Scenario 3: Send Message with Image**
```
1. User selects image file
2. Frontend calls POST /api/upload with multipart form
3. Backend validates file (size, type)
4. Backend uploads to S3/R2 using UploadService
5. Backend returns image URL
6. User clicks send
7. Frontend emits send_group_message { content, mediaUrl }
8. Server saves message to DB
9. Server broadcasts group_message to all room members
10. Frontend displays message with image
```

---

## **10. Deployment Architecture**

### **Option A: Monolith (Simpler)**
```
Vercel (Next.js + API Routes + Socket.io)
    ↓
PostgreSQL (Railway/Neon/Supabase)
Redis (Upstash)
S3 (AWS/Cloudflare R2)
```

### **Option B: Separated (Scalable)**
```
Vercel (Next.js Frontend + API Routes)
    ↓
Railway/Render (Socket.io Server - separate Node.js app)
    ↓
PostgreSQL (Railway/Neon)
Redis (Upstash/Railway)
S3 (AWS/Cloudflare R2)
```

---

## **11. Security Considerations**

- **Authentication**: JWT tokens or session-based auth
- **Rate Limiting**: Prevent spam (messages, matching requests)
- **File Upload**: Validate file types, size limits, scan for malware
- **Location Privacy**: Don't expose exact coordinates, use approximate location
- **Content Moderation**: Consider profanity filter, report system
- **CORS**: Properly configure for WebSocket and API
- **Data Encryption**: HTTPS, encrypted database connections

---

## **12. Performance Optimizations**

- **Message Pagination**: Use cursor-based pagination
- **Connection Pooling**: Prisma connection pooling
- **Redis Caching**: Cache active groups, online users
- **CDN**: Serve uploaded images via CDN
- **Database Indexing**: Index on location, timestamps, status fields
- **Lazy Loading**: Load old messages on scroll
- **WebSocket Rooms**: Use Socket.io rooms for efficient broadcasting

---