import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubjectGrid } from "./components/SubjectGrid";
import { LevelPopup } from "./components/LevelPopup";
import { ChapterList } from "./components/ChapterList";
import { ChapterPage } from "./components/ChapterPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SubjectGrid />} />
          <Route path="/:subject" element={
            <>
              <SubjectGrid />
              <LevelPopup />
            </>
          } />
          <Route path="/:subject/:level" element={<ChapterList />} />
          <Route path="/:subject/:level/:chapter" element={<ChapterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
