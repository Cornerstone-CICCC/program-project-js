import axios from "axios"; // 1. axios 임포트 확인

// 2. 백엔드 주소 설정 (기존에 쓰던 주소로 확인하세요)
const API_URL = "http://localhost:4000/api/shared-posts";

export const shareService = {
  // 전체 가져오기
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // 상세 가져오기
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 🟢 401 에러와 'api' 미정의 문제를 해결한 create 함수
  create: async (formData: FormData): Promise<any> => {
    const token = localStorage.getItem("token");

    // api 대신 axios를 직접 사용하거나,
    // 기존에 선언된 인스턴스 이름으로 바꿔주세요.
    const response = await axios.post(
      "http://localhost:4000/api/shared-posts",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // 👈 이 헤더가 중요합니다.
        },
      },
    );
    return response.data;
  },

  // 수정하기
  update: async (id: string, formData: FormData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // shareService.ts 에 추가
  updateStatus: async (
    id: string,
    status: "available" | "completed" | "canceled",
  ): Promise<any> => {
    const token = localStorage.getItem("token");
    // PATCH 또는 PUT (백엔드 라우트 설정에 맞춤, 여기선 PATCH 권장)
    const response = await axios.patch(
      `http://localhost:4000/api/shared-posts/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};
