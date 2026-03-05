// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./app/components/RequireAuth";
import AppLayout from "./app/components/AppLayout";

import LoginPage from "./app/pages/auth/LoginPage";
import SignUpPage from "./app/pages/auth/SignUpPage";

import IngredientsPage from "./app/pages/ingredients/IngredientsPage";
import AddIngredientPage from "./app/pages/ingredients/AddIngredientPage";
import ShareBoardPage from "./app/pages/share/ShareBoardPage";
import ChatPage from "./app/pages/chat/ChatPage";
import NotificationsPage from "./app/pages/notifications/NotificationsPage";
import RecipePage from "./app/pages/recipes/RecipePage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout>
              <IngredientsPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/ingredients"
        element={
          <RequireAuth>
            <AppLayout>
              <IngredientsPage />
            </AppLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/ingredients/new"
        element={
          <RequireAuth>
            <AppLayout>
              <AddIngredientPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/share"
        element={
          <RequireAuth>
            <AppLayout>
              <ShareBoardPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/chat"
        element={
          <RequireAuth>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route
        path="/recipes"
        element={
          <RequireAuth>
            <AppLayout>
              <RecipePage />
            </AppLayout>
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}