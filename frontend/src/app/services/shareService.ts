import axios from "axios";

// 백엔드 API 기본 주소 설정
const API_URL = "http://localhost:4000/api/shared-posts";

export const shareService = {
  // 1. 모든 나눔 게시글 가져오기 (필터링/검색 포함)
  getAll: async (searchQuery = ""): Promise<any[]> => {
    const response = await axios.get(`${API_URL}?search=${searchQuery}`);
    return response.data;
  },

  // 2. 특정 게시글 상세 정보 가져오기
  getById: async (id: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 3. 새로운 나눔 게시글 생성 (사진 포함이므로 FormData 사용)
  create: async (formData: FormData): Promise<any> => {
    // ⚠️ 사진 업로드 시에는 headers에 'Content-Type': 'multipart/form-data'가 필요할 수 있으나,
    // 최근 브라우저/Axios는 FormData를 넘기면 자동으로 설정해줍니다.
    const response = await axios.post(API_URL, formData);
    return response.data;
  },

  // 4. 내가 공유한(내가 작성한) 게시글만 가져오기
  // 백엔드에서 이 기능을 지원하도록 컨트롤러/라우터 추가가 필요합니다.
  getMyPosts: async (): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/my/posts`);
    return response.data;
  },

  // 5. 나눔 상태 변경 (Available -> Completed 등)
  updateStatus: async (id: string, status: string): Promise<any> => {
    const response = await axios.patch(`${API_URL}/${id}`, { status });
    return response.data;
  },

  // 6. 게시글 삭제
  delete: async (id: string): Promise<any> => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
