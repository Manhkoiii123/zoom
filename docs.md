# Stream & Clerk auth setup

1. setup stream

- vào https://dashboard.getstream.io/organization/1236392/apps
- create app => điền => create
- tạo env

```ts
NEXT_PUBLIC_STREAM_VIDEO_API_KEY = "tnsfykbqusn5";
STREAM_VIDEO_API_SERCET =
  "mkatwjzgvfzqnqeckcw53mqbrg8x7qektxt7nseszde5wm8uqksrc986nfd3m2s4";
```

2. setup clerk

- tạo app mới trên clerk (ok)
- copy key lúc ấn tạo xong(cho sẵn env)

```ts
NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
NEXT_PUBLIC_STREAM_VIDEO_API_KEY = "tnsfykbqusn5";
STREAM_VIDEO_API_SERCET =
  "mkatwjzgvfzqnqeckcw53mqbrg8x7qektxt7nseszde5wm8uqksrc986nfd3m2s4";
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
  pk_test_Y2xldmVyLWZsYW1pbmdvLTg0LmNsZXJrLmFjY291bnRzLmRldiQ;
CLERK_SECRET_KEY = sk_test_Vk1iOyNXWaTBhgxkfuoJzoMrLNiTkitVRwaG1WzzYm;
```

- chọn sang tab Account Portal =>
  Customization để custom màu sắc
- ấn sang docs với nextjs để đọc
  https://clerk.com/docs/quickstarts/nextjs
- bọc => ok docs
- viết src/middleware.ts

```ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/meeting/:id*"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

khi đó vào local/ thì tự động đá sang login do có mỗi cái /meeting kia là pub

- đăng kí xong tự động redirect về cái home
- viết src/compinen/navbar.tsx

```ts
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="shadow">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between p-3 font-medium">
        <Link href="/">New meeting</Link>
        <SignedIn>
          <div className="flex items-center gap-5">
            <Link href="/meetings">Meetings</Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
}
```

# setup stream (Stream video context provider)

link : https://getstream.io/video/sdk/react/tutorial/video-calling/

- tạo provider bọc ngoaif src/app/ClientProvider.tsx

```ts
"use client";

import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

  return videoClient;
}

```

bọc nó tại layout to nhất

```ts
<ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ClientProvider>
            <Navbar />
            <main className="mx-auto max-w-5xl px-3 py-6 ">{children}</main>
          </ClientProvider>
        </body>
      </html>
    </ClerkProvider>
```

viết tiếp hàm func useIi... trong provider

```ts
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
    const client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY || "",
      user: streamUser,
      tokenProvider : ,
    });
  }, []);
  return videoClient;
}
```

(chưa xong)

viết 1 cái server actions để lấy cái tokenPrivider kia
/app/actions.ts

```ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function getToken() {
  const streamApiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
  const streamApiSecret = process.env.STREAM_VIDEO_API_SERCET;

  if (!streamApiKey || !streamApiSecret) {
    throw new Error("Stream API key or servcet not set");
  }
  const user = await currentUser();
  console.log("Generating token for user ", user?.id);
  if (!user) {
    throw new Error("User not authenticated");
  }
  const streamClient = new StreamClient(streamApiKey, streamApiSecret);

  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

  const issuedAt = Math.floor(Date.now() / 1000) - 60;
  const token = streamClient.createToken(user.id, expirationTime, issuedAt);

  console.log("Successfully generated token: ", token);

  return token;
}
```

chốt lại file ClientProvider.tsx

```ts
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

```

create meeting xem commit github

- join

```ts
"use client";

import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface MeetingPageProps {
  id: string;
}
export default function MeetingPage({ id }: MeetingPageProps) {
  const [call, setCall] = useState<Call>();
  const client = useStreamVideoClient();
  if (!client) {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  if (!call) {
    return (
      <button
        onClick={async () => {
          const call = client.call("default", id);
          await call.join();
          setCall(call);
        }}
      >
        Join meeting
      </button>
    );
  }
  return (
    <StreamCall call={call}>
      <StreamTheme className="space-y-3">
        <SpeakerLayout />
        <CallControls />
      </StreamTheme>
    </StreamCall>
  );
}

```

# Custom call types & permissions (private meetings)

vào dashboard chọn video&audio =>chọn call types => xong
chonj role & permissions => chọn role user và scope là privatemeeting => eidt =>bỏ tích hết rồi ctrl f tìm create call read call => save
chọn role guest => private metting bỏ tích hết để lại mỗi cái readcall
role user => scope def => ỏ tích cái end call,tích vào End Update Own Call tương tự với member và primeeting

- tạo 1 actions lấy ra id của người dùng qua email

```ts
export async function getUserIds(emailAddress: string[]) {
  const res = await clerkClient.users.getUserList({
    emailAddress: emailAddress,
  });
  return res.map((u) => u.id);
}
```
