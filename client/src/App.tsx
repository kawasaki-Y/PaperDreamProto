import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Creator from "@/pages/Creator";
import PrintPreview from "@/pages/PrintPreview";
import Distribution from "@/pages/Distribution";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={Creator} />
      <Route path="/create/:id" component={Creator} />
      <Route path="/preview" component={PrintPreview} />
      <Route path="/distribute" component={Distribution} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* ThemeSwitcher — 全画面固定 left-bottom, 印刷時非表示 */}
        <div className="fixed bottom-6 left-6 z-50 print:hidden">
          <ThemeSwitcher />
        </div>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
