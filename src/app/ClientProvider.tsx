"use client";

import { getToken } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
}
export default function ClientProvider({ children }: ClientProviderProps) {
  const videoClient = useInitalizeVideoClient();

  if (!videoClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
function useInitalizeVideoClient() {
  const { user, isLoaded: userLoader } = useUser();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null,
  );
  useEffect(() => {
    if (!userLoader) return;
    let streamUser: User;
    if (user?.id) {
      streamUser = {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      };
    } else {
      const id = nanoid();
      streamUser = {
        id,
        type: "guest",
        name: `Guest ${id}`,
      };
    }
    const apikey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
    if (!apikey) throw new Error("Stream API key or servcet not set");
    const client = new StreamVideoClient({
      apiKey: apikey,
      user: streamUser,
      tokenProvider: user?.id ? getToken : undefined,
    });

    setVideoClient(client);
    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [user?.id, user?.imageUrl, user?.username, userLoader]);
  return videoClient;
}
