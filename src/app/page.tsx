import CreateMeetingPage from "@/app/CreateMeetingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meetings App",
  description: "A video calling app",
};

export default function Home() {
  return <CreateMeetingPage />;
}
