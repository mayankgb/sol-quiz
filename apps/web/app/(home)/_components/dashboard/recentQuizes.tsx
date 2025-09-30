"use client"

import { CreateQuizButton } from "@/app/_components/createQuiz/createQuiz"
import { getQuiz } from "@/app/actions/getquiz"
import { useRecentQuizStore , RecentQuiz} from "@/store/quizstore"
import { Grid, List, Users, Clock, PlusCircle } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

export default function RecentQuizes() { 

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const { quizes, setQuiz} = useRecentQuizStore()
    const [noData, setNoData] = useState(false)
    const [viewMode, setViewMode] = useState("grid")
    const [selectedTab, setSelectedTab] = useState("all")

    useEffect(() => { 
        async function main() { 
            setIsLoading(true)
            const response = await getQuiz()
            console.log(response.data)
            if (response.status > 200) {
                setError(response.message)
                setIsLoading(false)
                return
            }

            if ((!response.data) ||( response.data.length === 0)) {
               setNoData(true) 
               return
            }

            const data: RecentQuiz[] = response.data.map((value) => {  
                const date= value.CreatedAt.toLocaleDateString('en-US', { 
                    month: "short", 
                    day: "numeric",
                    year: "numeric" 

                })
                return { 
                    id: value.id, 
                    response: value._count.participantRank, 
                    title:  value.title,
                    status: value.quizStatus ==="CREATED" ? "Published" : value.quizStatus === "DRAFTED" ? "Draft" : "Ended", 
                    questions: value.template._count.Question, 
                    date: date
                }
            })

            setQuiz(data)
            setIsLoading(false)
            setError("") 
        }
        main()
    },[])

    async function CreateQuiz() {
        
    }

    return (
        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Quizzes</h2>
            <div className="flex items-center space-x-2">
              <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                <button 
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#FAF7FF]' : ''}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-[#FAF7FF]' : ''}`}
                  onClick={() => setViewMode("list")}
                >
                  <List size={18} />
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-1 flex overflow-hidden">
                {["all", "published", "draft"].map((tab) => (
                  <button 
                    key={tab}
                    className={`px-3 py-1 text-sm ${selectedTab === tab ? 'bg-[#FAF7FF] font-medium' : ''}`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-6">
              {quizes
                .filter(quiz => selectedTab === "all" || 
                  (selectedTab === "published" && quiz.status === "Published") ||
                  (selectedTab === "draft" && quiz.status === "Draft"))
                .map((quiz) => (
                <motion.div 
                  key={quiz.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border h-fit border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                      <span className={`text-xs rounded-full px-2 py-1 font-medium ${
                        quiz.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {quiz.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-3 space-x-4">
                      <div className="flex items-center">
                        <Grid size={14} className="mr-1" />
                        <span>{quiz.questions} questions</span>
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        <span>{quiz.response} responses</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={14} className="mr-1" />
                        <span>{quiz.date}</span>
                      </div>
                    
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Create New Quiz Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 hover:border-black transition-colors h-full min-h-64"
              >
                <div className="text-center">
                  <div className="bg-[#FAF7FF] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircle size={24} />
                  </div>
                  <div className="text-lg font-medium mb-2 ">
                    <CreateQuizButton/>
                  </div>
                  
                  {/* <h3 className="text-lg font-medium mb-2">Create New Quiz</h3> */}
                  <p className="text-sm text-gray-500">Start building an engaging quiz for your audience</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="bg-white w-full border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {/* <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quizes
                    .filter(quiz => selectedTab === "all" || 
                      (selectedTab === "published" && quiz.status === "Published") ||
                      (selectedTab === "draft" && quiz.status === "Draft"))
                    .map((quiz) => (
                    <motion.tr 
                      key={quiz.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {/* <div className="h-10 w-10 flex-shrink-0 mr-4">
                            {quiz.image ? (
                              <img className="h-10 w-10 rounded object-cover" src={quiz.image} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <Grid size={16} className="text-gray-500" />
                              </div>
                            )}
                          </div> */}
                          <span className="font-medium">{quiz.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{quiz.questions}</td>
                      <td className="px-6 py-4">{quiz.response}</td>
                      <td className="px-6 py-4">{quiz.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quiz.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {quiz.status}
                        </span>
                      </td>
                      
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    )
}