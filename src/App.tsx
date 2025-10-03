import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/navigation";
import AnimeList from "./pages/anime-list";
import MangaList from "./pages/manga-list";
import AddEntry from "./pages/add-entry";
import Statistics from "./pages/statistics";
import Import from "./pages/import";
import DeletedEntries from "./pages/deleted-entries";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="pt-20">
            <Routes>
            <Route path="/" element={<AnimeList />} />
            <Route path="/manga" element={<MangaList />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/import" element={<Import />} />
            <Route path="/deleted" element={<DeletedEntries />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
