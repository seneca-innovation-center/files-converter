# 🚀 Universal File Converter

A beautiful, modern, and open-source file converter built with Next.js 14+, supporting image format conversion with AI background removal, 3D model conversion (GLB, OBJ, USDZ), and general file format conversion.

![Universal File Converter](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🖼️ Image Conversion

- **Format Conversion**: Convert between PNG, JPEG, WebP, AVIF, TIFF, and BMP
- **AI Background Removal**: Remove backgrounds using advanced AI models
- **Quality Control**: Adjust quality for JPEG and WebP formats
- **Before/After Slider**: Interactive preview with drag-to-compare slider
- **Real-time Progress**: Track upload and processing progress

### 🎨 3D Model Conversion

- **Format Support**: Convert between GLB, OBJ, and USDZ formats
- **Optimization**: Optimize 3D models with pruning and welding
- **Draco Compression**: Compress GLB files with Draco compression
- **Interactive Preview**: 3D model viewer with orbit controls
- **Real-time Progress**: Track conversion progress

### 📄 File Conversion (Coming Soon)

- **Multiple Formats**: Support for PDF, Word, Excel, PowerPoint, Video, Audio, and more
- **Beautiful UI**: Stunning "Coming Soon" page with format cards
- **Upload Ready**: File upload system ready for future implementations

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand with Immer
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Icons**: Lucide React
- **3D Rendering**: React Three Fiber + Drei
- **Form Handling**: React Hook Form + Zod
- **File Upload**: React Dropzone

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohamedboukari/files-converter.git
   cd files-converter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend URL:

   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Required Dependencies

Make sure to install all required packages:

```bash
# Core dependencies
npm install zustand axios sonner lucide-react react-hook-form zod

# 3D rendering (lazy loaded)
npm install @react-three/fiber @react-three/drei three

# File upload
npm install react-dropzone

# UI dependencies
npm install clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-tabs @radix-ui/react-slider @radix-ui/react-separator
npm install @radix-ui/react-progress @radix-ui/react-toast @radix-ui/react-slot
```

## 🏗️ Project Structure

```
files-converter/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page with tabs
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ImageConverter.tsx
│   ├── ThreeDConverter.tsx
│   ├── FilesConverter.tsx
│   └── ModelViewer.tsx
├── state/                # Zustand stores
│   ├── useImagesStore.ts
│   ├── use3DStore.ts
│   └── useFilesStore.ts
├── lib/                  # Utilities
│   ├── api/             # API client
│   └── utils.ts         # Helper functions
├── providers/           # React providers
│   └── AppProviders.tsx
└── hooks/              # Custom hooks
    └── use-toast.ts
```

## 🎯 Usage

### Image Conversion

1. Navigate to the **Images** tab
2. Upload an image file (drag & drop or click to browse)
3. Select output format (PNG, JPEG, WebP, etc.)
4. Optionally enable background removal
5. Adjust quality if needed (for JPEG/WebP)
6. Click **Convert Image**
7. Use the slider to compare before/after
8. Download the converted image

### 3D Model Conversion

1. Navigate to the **3D Models** tab
2. Upload a 3D model file (GLB, GLTF, OBJ)
3. Select output format (GLB, OBJ, USDZ)
4. Optionally enable optimization and compression
5. Click **Convert 3D Model**
6. Preview the converted model in the 3D viewer
7. Download the converted file

### File Conversion (Coming Soon)

1. Navigate to the **Files** tab
2. Upload a file
3. Select target format from the grid
4. Click **Convert File**
5. Currently shows "Coming Soon" message

## 🔌 Backend API

This frontend requires a backend API running on `http://localhost:3001` (or configured URL).

### Endpoints

- `POST /api/images/convert` - Convert images
- `POST /api/3d/convert` - Convert 3D models
- `POST /api/files/convert` - Convert files

See the [backend repository](https://github.com/mohamedboukari/files-converter-api) for API documentation.

## 🎨 Customization

### Theme

The app supports light and dark modes automatically based on system preferences. You can customize colors in `app/globals.css`.

### Adding New Formats

1. Update types in `lib/api/types.ts`
2. Add format options to the respective converter component
3. Update the backend API to support the new format

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for 3D rendering
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ❤️ by [Mohamed Boukari](https://github.com/mohamedboukari)
