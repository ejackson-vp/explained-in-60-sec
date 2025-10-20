# Explained in 60 Seconds

An AI-powered micro-podcast generator that transforms any topic into an engaging 60-second audio podcast. Built with Next.js 15, TypeScript, and Material UI, integrated with Voltage Park AI Factory.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![Material UI](https://img.shields.io/badge/Material%20UI-v5-007FFF?logo=mui)](https://mui.com)

## Features

- 🎙️ **AI Podcast Generation** - Enter any topic and get a professionally narrated 60-second podcast
- 🎨 **Modern UI** - Sleek Material UI design with dark/light mode
- 📱 **Fully Responsive** - Optimized for all devices with touch-friendly controls
- 🎧 **Audio Player** - Custom player with progress tracking and timestamps
- ⚡ **Real-time Status** - Live polling to track generation progress
- 📥 **Downloadable** - Save generated podcasts locally
- 🌐 **Unified Architecture** - Single Next.js app with API routes and frontend

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [Voltage Park API credentials](https://voltagepark.com)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd explained-in-60-sec

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Voltage Park credentials

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VPSTUDIO_API_URL=your-voltagepark-api-url
VPSTUDIO_BEARER_TOKEN=your-bearer-token
```

Get your credentials from [Voltage Park](https://voltagepark.com).

## Usage

1. **Enter a Topic**: Type any topic (up to 128 characters) you want explained
2. **Generate**: Click the generate button and wait ~30-60 seconds
3. **Listen**: Play your podcast directly in the browser
4. **Download**: Save the podcast for offline listening

### Example Topics

- "How quantum computers work"
- "The history of the Roman Empire"
- "Machine learning basics"
- "Photosynthesis in plants"

## Technology Stack

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[Material UI v5](https://mui.com)** - Component library
- **[Emotion](https://emotion.sh)** - CSS-in-JS styling
- **[Voltage Park AI Factory](https://voltagepark.com)** - AI voice generation

## Project Structure

```
explained-in-60-sec/
├── app/
│   ├── api/
│   │   ├── podcast/
│   │   │   ├── route.ts              # POST - Create podcast
│   │   │   └── [id]/route.ts         # GET - Get status
│   │   └── health/route.ts           # Health check
│   ├── components/
│   │   ├── AudioCard.tsx             # Audio player component
│   │   └── ThemeRegistry.tsx         # Theme provider
│   ├── lib/
│   │   ├── theme.ts                  # Material UI theme
│   │   └── podcasts-store.ts         # State management
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── public/
│   ├── audio/                        # Example audio files
│   └── favicon.svg
├── .env.example                      # Environment template
├── next.config.js                    # Next.js config
├── tsconfig.json                     # TypeScript config
└── package.json
```

## API Endpoints

### POST /api/podcast

Create a new podcast generation job.

**Request:**
```json
{
  "topic": "Quantum Computing"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "topic": "Quantum Computing"
}
```

### GET /api/podcast/:id

Get the status of a podcast job.

**Response (completed):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "topic": "Quantum Computing",
  "title": "60 seconds on: Quantum Computing",
  "summary": "An AI-generated deep dive into Quantum Computing...",
  "audioUrl": "https://...",
  "duration": 60,
  "createdAt": "2025-10-20T...",
  "completedAt": "2025-10-20T..."
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T...",
  "podcasts": 3
}
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

Deploy to [Vercel](https://vercel.com) (recommended):

```bash
npm install -g vercel
vercel
```

Or deploy to:
- [Netlify](https://netlify.com)
- [AWS Amplify](https://aws.amazon.com/amplify)
- [Google Cloud Run](https://cloud.google.com/run)
- Any Node.js hosting platform

**Important:** Set environment variables (`VPSTUDIO_API_URL` and `VPSTUDIO_BEARER_TOKEN`) in your hosting platform's dashboard.

## Production Notes

The application currently uses in-memory storage for podcast jobs. For production deployment, consider:

1. **Database Integration** - Replace `podcasts-store.ts` with PostgreSQL, MongoDB, or Redis
2. **CDN for Audio** - Store generated audio files in S3 or similar
3. **Rate Limiting** - Implement API rate limits to prevent abuse
4. **User Authentication** - Add login/signup for tracking user podcasts
5. **Caching** - Cache completed podcasts to reduce API calls
6. **Monitoring** - Add logging and error tracking (e.g., Sentry)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Powered by [Voltage Park AI Factory](https://voltagepark.com)
- UI components from [Material UI](https://mui.com)
- Built with [Next.js](https://nextjs.org)

---

**Questions or issues?** Open an issue on GitHub or contact the maintainers.
