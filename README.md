# 🎓 Okie Dokie Pay — Enterprise Campus Communication & Payments ERP Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.x-black.svg)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Dual--Store-emerald.svg)](https://www.mongodb.com/)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> A full-stack MERN enterprise dashboard built for **[Okie Dokie Pay](https://okiedokiepay.com)** (`okiedokiepay.com` / Okie Dokie Solutions LLP) — automating student communication, parent 2-way engagement, digital fee collection reconciliation, gate security passes, and WhatsApp Business API (WABA) broadcast analytics.

---

## 🌟 Executive Summary

This project processes **68,659 real WhatsApp Business API messages** sent from Okie Dokie's verified campus automation sender (`+91 70156 13714`) across **10+ major educational institutions** (such as *Aggarwal College Ballabgarh*, *Gita Niketan Awasiya Vidyalaya*, *The Milestone School*, *The Genesis School*, and *PKG College of Engineering*).

It satisfies and exceeds all assignment requirements:
1. **Outbound Messaging Telemetry Hub (Dispatched Messages)**: Full real-time telemetry on all dispatched campus circulars, fee receipts, gate security passes, and attendance alerts with WhatsApp status indicators — single grey tick (Sent), double grey tick (Delivered), and double blue tick (Read).
2. **Bidirectional 2-Way Live Chat Inbox (Incoming Parent Inquiries)**: Real-time WhatsApp Web style two-way communication where parents reply to attendance alerts, fee receipts, and notices. Includes an **Interactive Parent Reply Simulator** for live demonstration, audio chime notifications, and **AI Smart Reply Suggestions**.
3. **Core Okie Dokie Pay Features**:
   - **Digital Fee Collection & Reconciliation**: Tracking over **₹8.77+ Crores** in verified online fee receipts (`fee_receipt2a`) and pending fee reminders (`stud_due_alert2`).
   - **Campus Gate Security Passes**: Real-time exit pass monitor (`stud_gate_alert3`) with authorized pickup person details and security clearance status.
   - **Daily Absentee Alerts**: Automated student attendance telemetry (`stud_attendance_alert1` & `2`).
   - **Broadcast Campaign Manager**: Multi-tenant campaign launcher with live delivery progress simulation.
   - **Delivery Failure Diagnostics**: Telco error breakdown (Invalid Recipient, Retry Exhausted) with 1-click retry engine.

---

## 🏗️ System Architecture & MERN Stack

```
okie-dokie/
├── backend/
│   ├── config/
│   │   └── db.js               # Dual-Engine: MongoDB Mongoose + High-Speed Indexed Store
│   ├── models/                 # Mongoose Schemas (Message, Conversation, Fee, GatePass, Campaign)
│   ├── routes/                 # REST APIs (analytics, messages, conversations, fees, gatepass, ai)
│   ├── data/
│   │   ├── store.js            # In-memory query engine with fast filtering & pagination
│   │   └── db.json             # Seeded dataset (25,000+ indexed messages & 6,150 conversations)
│   ├── scripts/
│   │   └── seed.py             # High-speed Python CSV parser for the 68,659 message archive
│   ├── server.js               # Express + Socket.IO real-time server (Port 5050)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Navbar.jsx             # Campus switcher, live status, sound toggle, audio alerts
│   │   │   ├── dashboard/DashboardView.jsx   # KPI cards, Recharts daily trends, funnel, hourly charts
│   │   │   ├── chat/TwoWayChatInbox.jsx      # WhatsApp Web 2-way inbox + Simulator + AI chips + Profile
│   │   │   ├── messages/MessagesHub.jsx      # Message explorer, preview modal, retry, CSV export
│   │   │   ├── fees/FeesView.jsx             # Online fee collection dashboard + printable receipt modal
│   │   │   ├── gatepass/GatePassView.jsx     # Campus security early exit feed
│   │   │   └── campaigns/CampaignView.jsx    # Broadcast manager & launch modal
│   │   ├── context/SocketContext.jsx         # WebSocket provider with audio notification tones
│   │   ├── services/api.js                   # Unified REST API client
│   │   ├── App.jsx                           # Main layout & tab router
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   └── dev.js                  # Runs backend + frontend concurrently
├── package.json                # Root automation scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer recommended, v24 supported)
- npm (v9 or newer)
- *(Optional)* MongoDB (The server has automatic dual-engine persistence: if MongoDB is running on port 27017 it connects via Mongoose; if not, it automatically runs seamlessly via the high-speed indexed JSON data store!)

### 1. Installation
In the project root directory (`/Users/nityaarya/Desktop/okie-dokie`):
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install --legacy-peer-deps
cd ..
```

### 2. Start the Full Application
You can run the unified development script from the root:
```bash
npm run dev
```
Or start backend and frontend separately:
```bash
# Terminal 1: Start Backend (Port 5050)
cd backend && npm start

# Terminal 2: Start Frontend (Port 5173)
cd frontend && npm run dev
```

### 3. Open the Dashboard
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Production Bundle**: [http://localhost:5050](http://localhost:5050)
- **Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

## 💬 2-Way Chat & Incoming Replies Simulation

The highlight of the platform is the **Two-Way Live Chat Inbox** (`TwoWayChatInbox.jsx`):
- **Live Parent Incoming Replies**: Displays messages received from parents (e.g. *“I have paid Rs. 16,300 via UPI. Please confirm receipt”*, *“My child had high fever yesterday, doctor note attached”*).
- **Interactive Simulator Button**:
  In the Chat header, click **`⚡ Simulate Parent Reply`** to trigger live parent responses on any conversation thread.
- **Audio Chime & Top Banner Toast**: When a simulated or live reply arrives, a WebAudio notification tone rings and a top alert banner notifies the agent.
- **AI Smart Reply Suggestions**: Automatically detects whether the parent is asking about fees, attendance, notices, or gate passes and suggests 3 one-click response templates.
- **Student Profile Drawer**: Displays student ID, class, parent contact, paid/pending fee status, and campus security clearance.

---

## 📊 Dashboard Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **Analytics Dashboard** | 5 KPI stat cards (Total Volume, Delivery Rate, Read Rate, Fees Reconciled, 2-Way Chats), Daily Traffic Area Chart, Delivery Funnel Progression, Template Pie Chart, Hourly Peak Broadcast density, Telco Error breakdown. |
| **2-Way Live Inbox** | WhatsApp split-pane UI, active threads, incoming parent replies, live audio alert, AI reply assistant, ERP student drawer, interactive simulator. |
| **Outgoing Messages Hub** | 25,000+ paginated message log, multi-parameter filters (Status, Template, Campus, Search), Interactive WhatsApp Message Preview modal, Error Retry engine, CSV Export. |
| **Fee Payments ERP** | Reconciles ₹8.77+ Crores in fee collections, receipts table, digital receipt voucher modal, 1-click WhatsApp overdue payment reminders. |
| **Gate Security Passes** | Campus security gate exit log (`stud_gate_alert3`), authorized pickup guardian names, contact numbers, security clearance status. |
| **Broadcast Campaigns** | WhatsApp campaign manager, scheduled blasts, delivery performance metrics, interactive launch modal with real-time dispatch progress. |
| **Campus Switcher** | Multi-tenant filtering across Aggarwal College Ballabgarh, Gita Niketan Awasiya Vidyalaya, The Genesis School, The Milestone School, PKG College, etc. |

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Service status, loaded record count, DB engine mode |
| `/api/analytics` | `GET` | Aggregated KPI stats, charts, funnel, hourly traffic |
| `/api/analytics/institutions`| `GET` | List of all onboarded schools and colleges |
| `/api/messages` | `GET` | Paginated message explorer with search, status & template filters |
| `/api/messages/retry/:id` | `POST` | Retries a failed or dropped message |
| `/api/messages/send` | `POST` | Dispatches a new outgoing message via WABA |
| `/api/conversations` | `GET` | List of 2-way conversation threads |
| `/api/conversations/:recipient` | `GET` | Full message history thread with a parent/student |
| `/api/conversations/:recipient/reply` | `POST` | Dispatches an agent reply to parent via WhatsApp |
| `/api/conversations/:recipient/simulate` | `POST` | Simulates an incoming reply from parent |
| `/api/fees` | `GET` | Fee receipts list, total revenue, student IDs |
| `/api/fees/remind` | `POST` | Sends automated fee due alert via WhatsApp |
| `/api/gatepass` | `GET` | Live campus security gate passes |
| `/api/campaigns` | `GET` / `POST` | Retrieve past campaigns or launch a new broadcast |
| `/api/ai/suggest-reply` | `POST` | Contextual AI suggested replies for support agents |

---

## 🔐 Built For
**Company Assignment:** [Okie Dokie Pay Careers](https://okiedokiepay.com/careers)  
**Platform:** [okiedokiepay.com](https://okiedokiepay.com)  
**Sector:** EdTech • FinTech • Campus Automation ERP • WhatsApp Business API (WABA)
