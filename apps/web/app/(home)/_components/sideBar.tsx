"use client"
import { Home, Grid, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function SideBar() {

  const pathname = usePathname()
  const router = useRouter()
  const session = useSession()

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">QuizChain</h1>
        </div>
        <nav className="flex-1 pt-2">
          <div className="px-3 py-2">
            <h2 className="text-xs text-gray-500 font-medium ml-3 mb-2">MENU</h2>
            <div className="space-y-1">
              {[
                { icon: <Home size={18} />,path: "/dashboard", label: "Dashboard" },
                { icon: <Grid size={18} />,path: "/quizes", label: "Quizzes" },
                { icon: <DollarSign size={18} />, path: "/payments", label: " Payments" },
                // { icon: <Users size={18} />, label: "Audience", active: false },
                // { icon: <Settings size={18} />, label: "Settings", active: false },
              ].map((item, i) => (
                <div 
                  key={i}
                  onClick={() => { 
                    if (pathname === item.path) {
                      return
                    }
                    router.push(item.path)
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                    item.path === pathname ? "bg-[#FAF7FF] text-black" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <span className="text-sm font-medium">AC</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">{session.data?.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    )
}