//App.tsx
import { Navigate, Route, Routes } from "react-router-dom";

import { Login } from "./app/pages/login";
import { SignUp } from "./app/pages/sign-up";
import { Profile } from "./app/pages/profile";
import { MainBoard } from "./app/pages/main-board";
import { AddIngredient } from "./app/pages/add-ingredient";
import { EditIngredient } from "./app/pages/edit-ingredient";
import { ShareBoard } from "./app/pages/share-board";
import { Chat } from "./app/pages/chat";
import { Notifications } from "./app/pages/notifications";
import { RecipeGenerator } from "./app/pages/recipe-generator";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/ingredients" element={<MainBoard />} />
      <Route path="/ingredients/new" element={<AddIngredient />} />
      <Route path="/ingredients/:id/edit" element={<EditIngredient />} />

      <Route path="/share" element={<ShareBoard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/recipes" element={<RecipeGenerator />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}