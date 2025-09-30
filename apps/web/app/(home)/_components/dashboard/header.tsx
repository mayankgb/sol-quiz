import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";
import { CreateQuizButton } from "@/app/_components/createQuiz/createQuiz";

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-500">Manage your quizzes and campaigns</p>
                </div>
                <div className="flex items-center rounded-lg justify-around items-center px-4 bg-[#FAF7FF] text-black hover:bg-[#FAF7FF]/90">
                  
                    
                        <PlusCircle size={18} className="mr-2" />
                        <CreateQuizButton/>
                    
                </div>
            </div>
        </header>
    )
}