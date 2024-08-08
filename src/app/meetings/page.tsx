import MyMeetingsPage from "@/app/meetings/MyMeetingsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Meetings",
};

export default function Page() {
  return <MyMeetingsPage />;
}
