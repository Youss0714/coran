import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { Search, Book } from "lucide-react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b p-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <Book className="w-6 h-6 text-primary" />
            <span>Al-Qur'an</span>
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Search className="w-4 h-4" />
              <span>Recherche</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © 2025 Application Coran Hors-ligne
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
