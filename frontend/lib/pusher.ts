import PusherServer from "pusher";
import PusherClient from "pusher-js";

// 서버용 (API에서 사용)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// 클라이언트용 (컴포넌트에서 사용)
export const getPusherClient = () => {
  const Pusher = (PusherClient as any).default || PusherClient;
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  });
};
