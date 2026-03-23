# Invoice System

A complete, production-ready web invoicing system built with Next.js, Firebase, and shadcn/ui.

## Features

- 🔐 **GitHub OAuth Authentication** - One-click sign-in
- ☁️ **Cloud Sync** - Access invoices from any device via Firebase
- 📝 **Invoice Management** - Create, edit, delete invoices
- 👁️ **Real-time Preview** - See invoice as you type
- 📥 **Export** - Download as PDF or PNG
- 📋 **Invoice Log** - View and manage all invoices

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Firebase (Auth + Firestore)
- shadcn/ui + Tailwind CSS
- React Hook Form + Zod
- html2canvas + jsPDF

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/invoice-system
cd invoice-system
npm install
```

### 2. Create Firebase Project

1. Go to firebase.google.com → **Get Started**
2. Create a new project
3. Enable **Firestore Database** (start in test mode)
4. Enable **Authentication** → **GitHub** provider

### 3. Set Up GitHub OAuth

1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Application name: `Invoice System`
3. Homepage URL: `http://localhost:3000`
4. Authorization callback URL: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
5. Copy **Client ID** and **Client Secret** → paste into Firebase GitHub Auth settings

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase project values from **Project Settings → General → Your apps → SDK setup and configuration**.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with auth provider
│   ├── page.tsx            # Dashboard (create new invoice)
│   ├── auth/login/         # Login page
│   └── invoices/
│       ├── page.tsx        # Invoice log
│       └── [id]/page.tsx   # Invoice detail/edit
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth-provider.tsx   # Firebase auth context
│   ├── navigation.tsx      # Top navigation bar
│   ├── invoice-form.tsx    # Invoice creation/edit form
│   ├── invoice-preview.tsx # Live invoice preview + export
│   └── invoice-list.tsx    # Invoice log list
└── lib/
    ├── firebase.ts         # Firebase configuration
    ├── types.ts            # TypeScript interfaces
    └── hooks/
        ├── useAuth.ts      # Authentication hook
        └── useInvoices.ts  # Invoice CRUD hook
```

## Firestore Security Rules

In Firebase Console → Firestore → Rules, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Deployment (Vercel)

1. Push to GitHub
2. Import to vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy!
