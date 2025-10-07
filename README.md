# 🎓 JEE Learning Hub - Master JEE Concepts

A comprehensive JEE preparation platform with level-based learning for Mathematics, Physics, and Chemistry. Features interactive AI tutors, mathematical playgrounds, and adaptive learning paths from beginner to advanced levels.

![JEE Learning Hub](https://lovable.dev/opengraph-image-p98pqg.png)

## 🚀 Live Demo

[Deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/your-username/learn-jee-flow)

## ✨ Features

### 🎯 **Core Learning Features**
- **Level-Based Learning**: Beginner → Intermediate → Advanced progression
- **Subject Coverage**: Mathematics, Physics, Chemistry
- **Interactive Playgrounds**: Hands-on learning with visual components
- **Practice MCQs**: Comprehensive question banks with instant feedback
- **Progress Tracking**: Monitor your learning journey

### 🤖 **AI-Powered Assistance**
- **Main AI Tutor**: Comprehensive help for any subject (N8N webhook integration)
- **AI Study Buddy**: Specialized guidance for practice questions (Gemini API)
- **Smart Explanations**: Context-aware responses based on your level
- **Mathematical Rendering**: Beautiful LaTeX/MathJax formula display

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Customizable appearance
- **Smooth Animations**: Framer Motion powered transitions
- **Accessible Components**: Built with Radix UI primitives

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for client-side routing

### **UI & Styling**
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible component primitives
- **Shadcn/ui** component library
- **Framer Motion** for animations
- **Lucide React** for icons

### **Mathematical Rendering**
- **MathJax 3** for LaTeX formula rendering
- **KaTeX** for fast math typesetting
- **React-KaTeX** for React integration

### **State Management**
- **Zustand** for global state
- **TanStack Query** for server state management
- **React Hook Form** for form handling

### **AI Integration**
- **Gemini 2.5 Flash API** for AI Study Buddy
- **N8N Webhook** for main AI tutor
- **Custom prompt engineering** for educational responses

### **Development Tools**
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **SWC** for fast compilation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn** or **bun**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learn-jee-flow.git
   cd learn-jee-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   ```
   http://localhost:8080
   ```

## 🌐 Vercel Deployment

### **Method 1: One-Click Deploy**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/learn-jee-flow)

### **Method 2: Manual Deployment**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite React app

3. **Configure Build Settings**
   ```bash
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables** (Optional)
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   ├── SubjectGrid.tsx  # Main subject selection
│   ├── ChapterList.tsx  # Chapter navigation
│   ├── ChapterPage.tsx  # Chapter content
│   ├── SidebarAIBot.tsx # Main AI tutor
│   └── QuestionAIChat.tsx # AI Study Buddy
├── data/                # Static data and types
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Route components
├── store/               # Zustand state management
├── App.tsx              # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🎯 Key Components

### **SubjectGrid**
- Main landing page
- Subject selection (Math, Physics, Chemistry)
- Level progression system

### **ChapterPage**
- Individual chapter content
- Interactive playgrounds
- Practice MCQs with AI help

### **SidebarAIBot**
- Main AI tutor for comprehensive help
- N8N webhook integration
- MathJax rendering for formulas

### **QuestionAIChat**
- Specialized AI Study Buddy
- Gemini API integration
- Quick action buttons (Explain, Step-by-step, Why?)

## 🔧 Configuration

### **API Keys**
```typescript
// For AI Study Buddy (Gemini)
const GEMINI_API_KEY = "your_gemini_api_key"

// For Main AI Tutor (N8N)
const N8N_WEBHOOK_URL = "your_n8n_webhook_url"
```

### **MathJax Configuration**
```html
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['\\(', '\\)'], ['$', '$']],
      displayMath: [['\\[', '\\]'], ['$$', '$$']],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    }
  };
</script>
```

## 🎨 Customization

### **Themes**
- Modify CSS variables in `src/index.css`
- Customize Tailwind colors in `tailwind.config.ts`
- Add new color schemes for different subjects

### **Adding New Subjects**
1. Update `src/data/types.ts`
2. Add subject data to `src/data/sampleData.ts`
3. Create new playground components
4. Update routing in `App.tsx`

### **AI Prompts**
- Modify prompts in `SidebarAIBot.tsx` and `QuestionAIChat.tsx`
- Adjust token limits and temperature settings
- Customize responses for different levels

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔒 Security

- API keys are handled securely
- No sensitive data stored in localStorage
- HTTPS enforced in production
- CORS properly configured

## 🚀 Performance

- **Vite** for fast builds and HMR
- **SWC** for lightning-fast compilation
- **Code splitting** with React.lazy
- **Optimized images** and assets
- **Tree shaking** for smaller bundles

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📈 Analytics & Monitoring

- Built-in error boundaries
- Console logging for debugging
- Performance monitoring ready
- SEO optimized with meta tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful components
- **Radix UI** for accessible primitives
- **MathJax** for mathematical rendering
- **Gemini API** for AI capabilities
- **Vercel** for hosting platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/learn-jee-flow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/learn-jee-flow/discussions)
- **Email**: support@jeelearninghub.com

---

**Built with ❤️ for JEE aspirants worldwide** 🌟

*Start your JEE preparation journey today!*