# 🚀 Universal File Converter

A beautiful, modern, and open-source file converter built with Next.js 14+, supporting image format conversion with AI background removal, 3D model conversion (GLB, OBJ, USDZ), media conversion and transcription, and general file format conversion.

![Universal File Converter](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🖼️ Image Conversion

- **Format Conversion**: Convert between PNG, JPEG, WebP, AVIF, TIFF, BMP, and SVG
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

### 🎬 Media Conversion

- **Video Conversion**: Convert between MP4, WebM, AVI, MOV, MKV, and GIF formats
- **Audio Extraction**: Extract audio from video files (MP3, WAV, AAC, FLAC)
- **Thumbnail Generation**: Generate thumbnails from videos at specific timestamps
- **Video Trimming**: Trim videos to specific time ranges
- **Frame Extraction**: Extract individual frames from videos
- **Subtitle Operations**: Extract or embed subtitles (SRT, VTT, ASS formats)
- **Video Transcription**: Transcribe video to text using OpenAI Whisper
  - **Multiple Output Formats**: Plain text (TXT), SubRip (SRT), WebVTT (VTT), or JSON with timestamps
  - **Language Support**: Auto-detect language or specify manually (ISO 639-1 codes)
  - **Real-time Preview**: View transcription results before downloading
- **Real-time Progress**: Track upload and processing progress for all operations

### 📄 File Conversion

- **Multiple Formats**: Support for PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), Archive (ZIP), and Text (TXT)
- **Format Selection**: Beautiful grid interface for selecting target formats
- **Smart Format Mapping**: Automatic conversion from display names to actual format extensions (e.g., Word → DOCX)
- **Real-time Progress**: Track upload and processing progress
- **Download Ready**: Download converted files with correct extensions

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
│   ├── MediaConverter.tsx
│   └── ModelViewer.tsx
├── state/                # Zustand stores
│   ├── useImagesStore.ts
│   ├── use3DStore.ts
│   ├── useFilesStore.ts
│   └── useMediaStore.ts
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
   - Supported input formats: PNG, JPEG, WebP, AVIF, TIFF, BMP, SVG
3. Select output format (PNG, JPEG, WebP, AVIF, TIFF, BMP, SVG)
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

### Media Conversion

1. Navigate to the **Media** tab
2. Upload a video or audio file (max 200MB)
3. Select operation mode:
   - **Convert** - Convert video/audio to different formats
   - **Extract Audio** - Extract audio track from video
   - **Thumbnail** - Generate thumbnail at specific time
   - **Trim** - Trim video to specific time range
   - **Extract Frame** - Extract individual frame from video
   - **Subtitles** - Extract or embed subtitles
   - **Transcribe** - Transcribe video to text using AI
4. Configure options based on selected operation
5. Click the operation button
6. Preview results (for videos, images, or transcriptions)
7. Download the result

#### Video Transcription

1. Select **Transcribe** mode
2. (Optional) Specify language code (e.g., 'en', 'fr', 'es') or leave empty for auto-detection
3. Choose output format:
   - **TXT** - Plain text transcription
   - **SRT** - SubRip subtitle format with timestamps
   - **VTT** - WebVTT format for web players
   - **JSON** - Structured JSON with timestamps and segments
4. Click **Transcribe Video**
5. View transcription preview
6. Download the transcription file

### File Conversion

1. Navigate to the **Files** tab
2. Upload a file (max 200MB)
3. Select target format from the grid:
   - **PDF** - Portable Document Format
   - **Word** - Converts to DOCX format
   - **Excel** - Converts to XLSX format
   - **PowerPoint** - Converts to PPTX format
   - **Archive** - Converts to ZIP format
   - **Text** - Converts to TXT format
4. Click **Convert File**
5. Download the converted file with the correct extension

## 🔌 Backend API

This frontend requires a backend API running on `http://localhost:3001` (or configured URL).

### Video Transcription Setup

For video transcription to work, the backend must have Whisper models installed. Run this command in the backend directory:

```bash
npx whisper-node download
```

This downloads the default 'base' model. Models are stored locally and used for transcription.

### Endpoints

- `POST /api/images/convert` - Convert images
- `POST /api/3d/convert` - Convert 3D models
- `POST /api/files/convert` - Convert files
- `POST /api/media/convert` - Convert media files
- `POST /api/media/extract-audio` - Extract audio from video
- `POST /api/media/thumbnail` - Generate video thumbnail
- `POST /api/media/trim` - Trim video
- `POST /api/media/extract-frame` - Extract frame from video
- `POST /api/media/subtitles` - Extract or embed subtitles
- `POST /api/media/transcribe` - Transcribe video to text

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
