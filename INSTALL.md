# Installation Guide

## Quick Start

### 1. Install All Dependencies

Run these commands in order:

```bash
# Core dependencies
bun add zustand axios sonner lucide-react react-hook-form zod immer

# 3D rendering (lazy loaded)
bun add @react-three/fiber @react-three/drei three

# File upload
bun add react-dropzone

# UI dependencies
bun add clsx tailwind-merge class-variance-authority
bun add @radix-ui/react-tabs @radix-ui/react-slider @radix-ui/react-separator
bun add @radix-ui/react-progress @radix-ui/react-toast @radix-ui/react-slot
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Backend Setup

Make sure your backend API is running on `http://localhost:3001` (or update `.env` accordingly).

The backend should have these endpoints:

- `POST /api/images/convert`
- `POST /api/3d/convert`
- `POST /api/files/convert`

## Troubleshooting

### GLTF/GLB Files Not Loading

- Ensure `three` and `@react-three/drei` are installed
- Check browser console for CORS errors
- Verify backend is running and accessible

### API Errors

- Check `NEXT_PUBLIC_BACKEND_URL` in `.env`
- Verify backend is running on the correct port
- Check browser network tab for request details

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && bun add`
- Check Node.js version (requires 18+)
