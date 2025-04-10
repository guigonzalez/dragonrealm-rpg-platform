import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CharacterSheetPage from "@/pages/character-sheet-page";
import CharacterCreationPage from "@/pages/character-creation-page";
import CampaignManagementPage from "@/pages/campaign-management-page";
import NPCCreatorPage from "@/pages/npc-creator-page";
import EncounterBuilderPage from "@/pages/encounter-builder-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/character-sheet/:id" component={CharacterSheetPage} />
      <ProtectedRoute path="/character-creation/:id?" component={CharacterCreationPage} />
      <ProtectedRoute path="/campaign-management/:id?" component={CampaignManagementPage} />
      <ProtectedRoute path="/npc-creator/:campaignId" component={NPCCreatorPage} />
      <ProtectedRoute path="/encounter-builder/:campaignId" component={EncounterBuilderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
