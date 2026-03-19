import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const SHARE_API_URL = `${API_URL}/shared-posts`;

export const shareService = {
  // 1. 전체 목록 가져오기
  getAll: async () => {
    const response = await axios.get(SHARE_API_URL);
    return response.data;
  },

  // 2. 상세 정보 가져오기
  getById: async (id: string) => {
    const response = await axios.get(`${SHARE_API_URL}/${id}`);
    return response.data;
  },

  // 3. 게시글 생성
  create: async (formData: FormData): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(SHARE_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 4. 게시글 수정
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${SHARE_API_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 5. 게시글 삭제
  delete: async (id: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${SHARE_API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // 6. 상태 변경
  updateStatus: async (
    id: string,
    status: "available" | "completed" | "canceled",
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${SHARE_API_URL}/${id}`, // 👈 여기에 있던 /status를 삭제했습니다!
      { status },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  // 7. 댓글 추가 (Axios로 통일 및 경로 수정)
  addComment: async (id: string, data: { content: string }) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${SHARE_API_URL}/${id}/comments`, // ✅ /share 대신 /shared-posts 경로 사용
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  },
};
