import MeetingPage from "@/app/meeting/[id]/MeetingPage";
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
export default function Page({ params: { id } }: PageProps) {
  return <MeetingPage id={id} />;
}
