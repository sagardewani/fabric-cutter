# 📐 Fabric Cutting Calculator

A smart fabric cutting calculator with zero-leftover optimization based on demand probabilities. Maximize fabric efficiency and minimize waste with intelligent cutting plans.

![Fabric Cutting Calculator](https://img.shields.io/badge/Type-Web_Application-blue) ![Technology](https://img.shields.io/badge/Tech-React_TypeScript-61dafb) ![Optimization](https://img.shields.io/badge/Feature-Zero_Leftover-green)

## ✨ Features

### 🎯 **Zero-Leftover Optimization**
- Advanced algorithm that prioritizes achieving zero fabric waste
- Smart combination testing to find perfect cutting solutions
- Falls back to minimal waste if zero leftover isn't possible

### 📊 **Priority-Based System**
- High-demand fabric sizes (≥15% probability) are always included
- Low-demand sizes can be excluded if they prevent zero leftover
- Proportional distribution based on weekly demand probabilities

### 🔧 **Customizable Demand Settings**
- Edit weekly demand for each fabric size
- Visual priority indicators (⭐ for high-priority sizes)
- Real-time probability calculations and updates

### 🎨 **Beautiful UI**
- Clean, modern interface with intuitive controls
- Results sorted by piece count for better visibility
- Smart number formatting (no unnecessary decimals)
- Success celebrations when zero leftover is achieved

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fabric-calc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## 🌐 Deployment

### Netlify Deployment

This project is configured for easy Netlify deployment:

1. **Connect your repository** to Netlify
2. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Deploy**: Netlify will automatically build and deploy your site

#### Troubleshooting Netlify Issues:
- ✅ **Redirects configured**: `netlify.toml` and `_redirects` handle SPA routing
- ✅ **Base path set**: Vite config uses relative paths for assets
- ✅ **Build optimization**: Proper chunk splitting and asset handling

### Other Deployment Options

**Vercel:**
```bash
npm run build
# Upload dist folder to Vercel
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist folder to gh-pages branch
```

**Manual hosting:**
```bash
npm run build
# Upload contents of dist folder to your web server
```

## 🎮 How to Use

1. **Enter Fabric Length**: Input the total length of fabric you want to cut (e.g., 32.5 meters)

2. **Customize Demand Settings**: Click on fabric size cards to edit weekly demand numbers
   - Sizes with ≥15% probability become "Priority" (marked with ⭐)
   - Priority sizes are always included in calculations
   - Optional sizes may be excluded for zero leftover

3. **Calculate**: Click "Calculate Optimal Cuts" to get your cutting plan

4. **View Results**: 
   - Cut plan sorted by number of pieces (highest first)
   - Summary showing total used, pieces, and leftover
   - Special celebration banner for zero leftover achievements

## 🏗️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Development**: Hot Module Replacement (HMR)

## 🧮 Algorithm Details

The calculator uses a sophisticated multi-step optimization process:

1. **Priority Classification**: Separates fabric sizes into priority (≥15%) and optional (<15%) categories
2. **Zero-Leftover Search**: Attempts to find combinations that use exactly all fabric
3. **Proportional Distribution**: Calculates target pieces based on demand probabilities
4. **Smart Bounds**: Sets reasonable limits to prevent small sizes from dominating
5. **Fallback Strategy**: Minimizes waste when perfect solutions aren't possible

## 📝 Example

For 32.5m of fabric with default demand settings:
- **Input**: 32.5 meters
- **Optimal Result**: 6×2.5m + 4×3m + 2×2.25m + 1×1m = 32.5m
- **Leftover**: 0m (Perfect cut! 🎯)

## 🎨 Default Fabric Sizes

| Size | Weekly Demand | Probability | Priority |
|------|---------------|-------------|----------|
| 2.5m | 10 pieces | 33.3% | ⭐ Priority |
| 3m | 7 pieces | 23.3% | ⭐ Priority |
| 2.25m | 5 pieces | 16.7% | ⭐ Priority |
| 2m | 4 pieces | 13.3% | Optional |
| 5m | 3 pieces | 10.0% | Optional |
| 1m | 1 piece | 3.3% | Optional |

## 🔧 Configuration

You can modify the default fabric sizes in `src/utils/fabricCalculator.ts`:

```typescript
export const DEFAULT_FABRIC_SIZES: FabricSize[] = [
  { size: 2.5, weeklyDemand: 10, probability: 0 },
  { size: 3, weeklyDemand: 7, probability: 0 },
  // ... add your custom sizes
];
```

## 📱 PWA Support

The app includes Progressive Web App features:
- Custom favicon with scissors and fabric theme
- Web app manifest for installation
- Responsive design for mobile and desktop

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Styled with Tailwind CSS for beautiful UI
- Icons provided by Lucide React
- Optimized with Vite for fast development

---

**Made with ❤️ for fabric cutting optimization**
