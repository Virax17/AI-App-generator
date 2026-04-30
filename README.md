# 🚀 AppForge: The Ultimate AI-Driven App Generator

AppForge is a high-performance, schema-driven application engine that transforms JSON configurations into fully functional, production-ready web applications instantly. Built with a focus on visual excellence, resilience, and developer productivity.

![AppForge Hero](https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=1200)

## ✨ Stand-Out Features

### 1. 🛠️ Interactive "Live Forge" Playground
Experience real-time development with our split-screen playground. 
- **Live Monaco Editor**: Edit your JSON schema with full syntax highlighting and validation.
- **Instant Preview**: Watch your application interface synchronize instantly as you type.
- **Base64 URL Sharing**: Share your entire application configuration via a single, encoded URL.

### 2. 🛡️ Self-Healing Configuration Engine
Never let a malformed JSON crash your production environment. Our engine uses an advanced heuristic "Config Healer":
- **Schema Inference**: Automatically generates labels and default values from field names.
- **Type Coercion**: Gracefully handles inconsistent data types (e.g., strings to booleans).
- **Graceful Degradation**: Unknown field types render as interactive warnings rather than breaking the UI.

### 3. 📥 Seamless Data Integration
- **CSV Bulk Import**: Upload existing datasets directly into your generated applications.
- **Dynamic Table Rendering**: High-performance data tables with animated transitions and management controls.
- **Export to Code**: Export your generated app as a standalone React component or raw JSON.

### 4. 🎨 Premium Design System
- **Next-Gen Dark Mode**: A sleek, high-contrast interface designed for professional use.
- **Motion-Enhanced UX**: Fluid transitions and micro-animations powered by `framer-motion`.
- **Glassmorphism & Mesh Gradients**: A state-of-the-art visual experience that feels premium out of the box.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Monaco Editor.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Security**: Google OAuth 2.0 Integration & JWT-based authentication.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Virax17/AI-App-generator.git
   cd AI-App-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_client_id
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3000`.

---

## 📖 How it Works

1. **Paste**: Input your JSON schema in the Create Modal or Playground.
2. **Forge**: The engine validates, heals, and renders the UI in milliseconds.
3. **Deploy**: Manage submissions, import data, and export your production-ready code.

---

## 🤝 Contributing
Built with ❤️ for the AI App Generator challenge.
