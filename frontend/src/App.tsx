//App.tsx
import { Navigate, Route, Routes } from "react-router-dom";

import { Login } from "./app/pages/login";
import { SignUp } from "./app/pages/sign-up";
import { Profile } from "./app/pages/profile";
import { MainBoard } from "./app/pages/main-board";
import { AddIngredient } from "./app/pages/add-ingredient";
import { IngredientDetail } from "./app/pages/ingredient-detail";
import { EditIngredient } from "./app/pages/edit-ingredient";
import { ShareBoard } from "./app/pages/share-board";
import { Chat } from "./app/pages/chat";
import { Notifications } from "./app/pages/notifications";
import { RecipeGenerator } from "./app/pages/recipe-generator";
import { AddShare } from "./app/pages/add-share";
import { ShareDetail } from "./app/pages/ShareDetail";
import { EditShare } from "./app/pages/EditShare";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ingredients" element={<MainBoard />} />
      <Route path="/ingredients/new" element={<AddIngredient />} />
      <Route path="/ingredients/:id" element={<IngredientDetail />} />
      <Route path="/ingredients/:id/edit" element={<EditIngredient />} />
      <Route path="/share" element={<ShareBoard />} />
      <Route path="/share/add" element={<AddShare />} /> {/* 🟢 추가 */}
      <Route path="/share/:id" element={<ShareDetail />} />
      <Route path="/share/:id/edit" element={<EditShare />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/recipes" element={<RecipeGenerator />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
