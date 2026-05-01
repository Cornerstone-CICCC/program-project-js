export default {
  plugins: {
    "@tailwindcss/postcss": {}, // ✅ 이 부분이 에러 메시지에서 요구한 포인트입니다.
    autoprefixer: {}, // ✅ 아까 없다고 뜬 모듈입니다.
  },
};
