import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIngredients } from "../hooks";
import { ArrowLeft, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ingredients, update, remove, refresh } = useIngredients();

  // 현재 수정 중인지 여부
  const [isEditing, setIsEditing] = useState(false);
  // 수정용 로컬 상태
  const [editData, setEditData] = useState({
    name: "",
    expiration_date: "",
    category: "",
  });

  // 1. 전체 리스트에서 해당 ID의 재료 찾기
  const item = ingredients.find((i) => i._id === id);

  useEffect(() => {
    if (item) {
      setEditData({
        name: item.name,
        expiration_date: item.expiration_date,
        category: item.category,
      });
    }
  }, [item]);

  if (!item)
    return <div className="p-10 text-center">Ingredient not found.</div>;

  // 수정 저장 핸들러
  const handleSave = async () => {
    try {
      if (!id) return;
      await update(id, editData);
      setIsEditing(false);
      alert("Updated successfully!");
    } catch (e) {
      alert("Update failed.");
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("Delete this item?")) return;
    try {
      if (!id) return;
      await remove(id);
      navigate("/ingredients"); // 삭제 후 메인으로
    } catch (e) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-bold">Details</h1>
        <Button variant="ghost" onClick={handleDelete} className="text-red-500">
          <Trash2 size={20} />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Image Section */}
        <div className="w-full h-64 bg-slate-100 rounded-3xl overflow-hidden flex items-center justify-center text-6xl">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              className="w-full h-full object-cover"
              alt={item.name}
            />
          ) : (
            "🍎"
          )}
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Item Name</label>
            {isEditing ? (
              <Input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
            ) : (
              <p className="text-xl font-bold">{item.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-400">Expiration Date</label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.expiration_date}
                onChange={(e) =>
                  setEditData({ ...editData, expiration_date: e.target.value })
                }
              />
            ) : (
              <p className="text-lg text-slate-700">{item.expiration_date}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="fixed inset-x-0 bottom-10 px-6">
          {isEditing ? (
            <Button
              onClick={handleSave}
              className="w-full bg-[#1d7d5e] h-14 rounded-2xl gap-2"
            >
              <Check size={20} /> Save Changes
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-800 h-14 rounded-2xl gap-2 text-white"
            >
              <Edit2 size={20} /> Edit Ingredient
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
