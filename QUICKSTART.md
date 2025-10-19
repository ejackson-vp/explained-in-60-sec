# Quick Start Guide

Get your "Explained in 60 seconds" app running in 3 simple steps!

## 🚀 Installation & Run

```bash
# 1. Install dependencies (already done if you followed the main instructions)
npm install

# 2. Start the development server
npm run dev

# 3. Open your browser to the URL shown (typically http://localhost:5173)
```

## ✅ What's Included

All dependencies are already installed:
- ✅ Material UI v5 + Icons
- ✅ React Router DOM
- ✅ Emotion (styling)
- ✅ Inter Variable font
- ✅ All components and pages
- ✅ Mock authentication system
- ✅ Placeholder audio files

## 🎯 Test the Features

### 1. Try the Landing Page
- View hero section with gradient
- Scroll to "Explore Sample Episodes"
- Try playing the audio on example cards
- Click share/copy buttons

### 2. Toggle Dark Mode
- Click the sun/moon icon in the header
- Theme persists in localStorage

### 3. Test Authentication
- Click "Login" button
- Enter any email address
- See your avatar appear
- Try creating a podcast while logged in

### 4. Generate a Podcast
- Navigate to "Create yours" (login required)
- Enter a topic like "Photosynthesis"
- Click "Generate 60-second podcast"
- Wait 2.5 seconds for simulation
- Play your "generated" podcast

### 5. Mobile Responsive
- Resize your browser window
- Test hamburger menu on mobile
- Verify all touch targets are 44px+
- Check that cards stack properly

## 📱 Test on Mobile

```bash
# Get your local IP
ifconfig | grep "inet "

# Access from mobile device
http://YOUR_IP:5173
```

## 🎨 Customization Quick Tips

### Change Brand Colors
Edit `src/theme.js`:
```javascript
primary: {
  main: '#5e35b1', // Change this!
}
```

### Update Example Episodes
Edit `src/pages/Home.jsx`:
```javascript
const exampleEpisodes = [
  // Add/modify episodes here
];
```

### Replace Audio Files
Replace files in `public/audio/`:
- sample1.mp3
- sample2.mp3
- ... etc

## 🔧 Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

## 📊 Check Performance

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Generate report for:
   - Performance (target: 90+)
   - Accessibility (target: 95+)
   - Best Practices
   - SEO

## 🐛 Common Issues

**Audio not playing?**
- Check browser console for errors
- Verify audio files exist in `public/audio/`
- Try a different browser

**Dark mode not saving?**
- Check localStorage in DevTools
- Clear cache and retry

**Login not working?**
- This is mock auth - any email works
- Check console for errors

**Mobile menu not opening?**
- Resize to mobile width (< 900px)
- Click hamburger menu icon

## 📚 Next Steps

1. Replace mock auth with real backend
2. Integrate real podcast generation API
3. Add user profiles and history
4. Implement analytics
5. Deploy to production

See `README.md` for detailed backend integration guide.

## 🎉 You're All Set!

Your app is production-ready (frontend-only). Just add a backend API for full functionality!

Questions? Check the main README.md or file an issue.

Happy coding! 🚀

