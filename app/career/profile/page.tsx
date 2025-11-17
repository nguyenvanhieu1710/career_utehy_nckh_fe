import ProfileForm from "@/components/profile/ProfileForm";
import ProfileSidebar from "@/components/profile/ProfileSidebar";

export default function AccountPage() {
  return (
    <>
      <div className="flex-1 text-gray-600">
        <ProfileForm />
      </div>
      <div className="w-full md:w-[320px] text-gray-600">
        <ProfileSidebar />
      </div>
    </>
  );
}
