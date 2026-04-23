import type { Config } from "tailwindcss";

const config: Config = {
  // ✅ 핵심: Tailwind가 스타일을 적용할 파일 경로를 지정합니다.
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // app 디렉토리를 사용한다면 필수!
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 여기에 커스텀 컬러나 폰트를 추가할 수 있습니다.
    },
  },
  plugins: [],
};

export default config;
