# 🚀 Vercel Deployment Guide

## Framework Analysis

Based on your codebase analysis, here's what you have:

### **✅ Your Framework: Vite + React + TypeScript**

- **Build Tool**: Vite (not Next.js)
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Routing**: React Router DOM (client-side)
- **State**: Zustand + TanStack Query

## 🎯 Vercel Deployment Steps

### **Step 1: Prepare Your Repository**

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/your-username/learn-jee-flow.git
   git push -u origin main
   ```

### **Step 2: Deploy to Vercel**

#### **Option A: One-Click Deploy**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel will auto-detect it's a Vite app
5. Click "Deploy"

#### **Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: learn-jee-flow
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Install Command: npm install
```

### **Step 3: Configure Build Settings**

Vercel should auto-detect these settings, but verify:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### **Step 4: Environment Variables (Optional)**

If you want to use environment variables for API keys:

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key
     VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
     ```

2. **Update your code** (if using env vars):
   ```typescript
   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBL_Mw0uwvrv285BnWoQ334XGQZtekB_pE";
   ```

### **Step 5: Custom Domain (Optional)**

1. **In Vercel Dashboard**:
   - Go to "Domains"
   - Add your custom domain
   - Update DNS records as instructed

## 🔧 Build Configuration

### **Vite Config** (already optimized):
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  // ... rest of config
});
```

### **Package.json Scripts** (already correct):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🌐 Deployment Checklist

### **Pre-Deployment**:
- [ ] All dependencies installed (`npm install`)
- [ ] Build works locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] All API keys configured
- [ ] MathJax CDN links working
- [ ] Responsive design tested

### **Post-Deployment**:
- [ ] Site loads correctly
- [ ] All routes work (React Router)
- [ ] AI features functional
- [ ] MathJax rendering works
- [ ] Mobile responsive
- [ ] Performance optimized

## 🚨 Common Issues & Solutions

### **Issue 1: Build Fails**
```bash
# Solution: Check Node version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Issue 2: MathJax Not Loading**
```html
<!-- Ensure CDN links are correct in index.html -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

### **Issue 3: API Calls Fail**
- Check CORS settings
- Verify API keys are correct
- Test API endpoints manually

### **Issue 4: Routing Issues**
```typescript
// Ensure React Router is configured correctly
<BrowserRouter>
  <Routes>
    <Route path="/" element={<SubjectGrid />} />
    <Route path="/:subject" element={<SubjectGrid />} />
    {/* ... other routes */}
  </Routes>
</BrowserRouter>
```

## 📊 Performance Optimization

### **Vite Optimizations**:
- Automatic code splitting
- Tree shaking
- Asset optimization
- CSS minification

### **Vercel Optimizations**:
- Global CDN
- Automatic HTTPS
- Edge functions (if needed)
- Image optimization

## 🔒 Security Considerations

- API keys are in frontend code (consider moving to backend)
- HTTPS enforced automatically
- CORS properly configured
- No sensitive data in localStorage

## 📈 Monitoring & Analytics

### **Vercel Analytics**:
- Built-in performance monitoring
- Real-time metrics
- Error tracking

### **Custom Analytics**:
- Google Analytics (optional)
- Custom event tracking
- User behavior analysis

## 🎯 Final Deployment Commands

```bash
# 1. Build locally to test
npm run build

# 2. Test production build
npm run preview

# 3. Deploy to Vercel
vercel --prod

# 4. Verify deployment
# Check your Vercel dashboard for the live URL
```

## 🌟 Success Indicators

Your deployment is successful when:
- ✅ Site loads at your Vercel URL
- ✅ All subjects/chapters navigate correctly
- ✅ AI Study Buddy responds to questions
- ✅ MathJax formulas render properly
- ✅ Mobile responsive design works
- ✅ Performance scores are good

---

**Your JEE Learning Hub is now live on Vercel! 🎉**

*Share your deployed URL and start helping JEE aspirants worldwide!*
