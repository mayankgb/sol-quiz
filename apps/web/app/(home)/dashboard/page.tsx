import RecentQuizes from "../_components/dashboard/recentQuizes";
import Header from "../_components/dashboard/header";

const AdminDashboard = () => {

  return (
      <div className="flex-1 w-[100%] overflow-auto">
        {/* Header */}
        <Header/>
        {/* Recent Quizzes */}
        <RecentQuizes/>
      </div>
    
  );
};

export default AdminDashboard;