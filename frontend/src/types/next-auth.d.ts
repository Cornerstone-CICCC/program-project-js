import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * 세션 객체에 들어가는 유저 타입 확장
   */
  interface Session {
    user: {
      /** 유저의 고유 ID (MongoDB의 _id) */
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * JWT 토큰 타입 확장 (필요한 경우)
   */
  interface User {
    id: string;
  }
}
