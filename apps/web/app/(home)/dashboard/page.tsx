"use client"

import { useState } from "react";
import RecentQuizes from "../_components/dashboard/recentQuizes";
import Header from "../_components/dashboard/header";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTab, setSelectedTab] = useState("all");

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