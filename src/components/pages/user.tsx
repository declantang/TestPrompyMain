import UserDashboard from "../user/UserDashboard";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function UserPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <UserDashboard />
      <Footer />
    </div>
  );
}
