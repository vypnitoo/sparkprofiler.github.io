# ⚡ Spark Analyzer

A fast web app for analyzing Minecraft Spark profiler reports. Paste a URL, get instant recommendations on what's slowing down your server.

## What It Does

Takes Spark profiler URLs and tells you:
- What's wrong with your server
- How bad it is
- How to fix it

No BS, just straight answers.

## Features

- **2-second workflow**: Paste URL → Get results
- **Clear recommendations**: Actually useful advice, not vague suggestions
- **Works everywhere**: Web, desktop (.exe), Android
- **Fast as hell**: Built with modern tech, loads instantly
- **Looks good**: Dark theme, smooth animations, doesn't hurt your eyes

## What It Checks

- **TPS** - Is your server keeping up?
- **MSPT** - How long ticks are taking
- **Memory** - RAM usage and garbage collection
- **CPU** - Processor load
- **Entities** - Too many mobs killing performance?
- **Chunks** - Which areas are the worst

## Tech Stack

Built with:
- Next.js 15 (fast as hell)
- React 18
- TypeScript (because we're not animals)
- Tailwind CSS
- Framer Motion (smooth animations)
- Recharts (those pretty graphs)

For desktop/mobile:
- Tauri (Rust-based, tiny binaries)
- Capacitor (Android APK)

## How to Use

### Web Version
Just open it and paste your Spark URL. Done.

### Build Desktop Version (.exe)
```bash
npm install
npm run build
# If you have Tauri installed:
npm run tauri:build
```

Your .exe will be in `src-tauri/target/release/bundle/`

### Build Android
```bash
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android
```

Then build the APK in Android Studio.

## Development

```bash
# Install stuff
npm install

# Run locally
npm run dev

# Build for web
npm run build
```

## Why This Exists

Spark profiler gives you raw data but doesn't tell you what to do about it. This tool does the analysis and gives you actual fixes you can implement.

## File Sizes

- Web: ~500KB (gzipped)
- Desktop: ~10MB (Tauri is efficient AF)
- Android: ~15MB

## Contributing

PRs welcome. Keep it fast, keep it simple.

## License

MIT - Do whatever you want with it.

## Credits

Spark profiler by [lucko](https://github.com/lucko/spark) - This tool just makes it easier to understand the reports.

---

**Note**: This is a third-party tool. Not affiliated with Spark or Minecraft.
