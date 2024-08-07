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
