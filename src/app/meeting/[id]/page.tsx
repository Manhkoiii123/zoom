import MeetingLoginPage from "@/app/meeting/[id]/MeetingLoginPage";
import MeetingPage from "@/app/meeting/[id]/MeetingPage";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";

interface PageProps {
  params: {
    id: string;
  };
}
export function generateMetadata({ params: { id } }: PageProps): Metadata {
  return {
    title: `Meeting ${id}`,
  };
}
export default async function Page({ params: { id } }: PageProps) {
  // const guestMode = guest === "true";
  const user = await currentUser();
  if (!user) return <MeetingLoginPage />;
  return <MeetingPage id={id} />;
}
