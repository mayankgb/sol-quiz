"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Trophy, CreditCard, Edit, Play } from "lucide-react"
import { getAllQuiz } from "@/app/actions/getquiz"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from "axios"
import { toast } from "sonner"

interface AllQuiz {
  id: string
  title: string
  isPrizePool: boolean
  PaymentStatus: "PENDING" | "CONFIRMED" | "NO_PAYMENT"
  quizStatus: "Draft" | "Created" | "Started" | "Ended"
  templateId: string
  createdAt?: string, 
  isTemplate: boolean
  //   participants?: number
}

const filterCategories = [
  { key: "all", label: "All Quizzes" },
  { key: "active", label: "Active" }, // Draft & Created
  { key: "started", label: "Started" },
  { key: "ended", label: "Ended" }
]

export default function QuizesPage() {
  const [allQuiz, setAllQuiz] = useState<AllQuiz[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isDisabled, setIsDisabled] = useState(false)
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    // Simulate API call
    async function main() {
      setIsLoading(true)
      const response = await getAllQuiz()
      console.log(response.data)
      if (response.status === 200 && response.data) {
        const data: AllQuiz[] = response.data.map((value) => {
          const date = value.CreatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
          return {
            id: value.id,
            isPrizePool: value.isPrizePool,
            title: value.title,
            PaymentStatus: value.amountStatus == "CONFIRMED" ? "CONFIRMED" : value.amountStatus == "PENDING" ? "PENDING" : value.amountStatus == "NO_PAYMENT" ? "NO_PAYMENT" : "NO_PAYMENT",
            quizStatus: value.quizStatus == "CREATED" ? "Created" : value.quizStatus == "DRAFTED" ? "Draft" : value.quizStatus === "ENDED" ? "Ended" : "Started",
            templateId: value.templateId,
            createdAt: date, 
            isTemplate: value.isTemplate
          }
        })

        setAllQuiz(data)
        setIsLoading(false)
      }else { 
        setIsLoading(false)
      }
    }
    main()
  }, [])


  async function start(quizId:string) { 
    const toastId = toast.loading("initialising...")
    setIsDisabled(true)
    try { 

      const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/start`,{ 
       quizId: quizId
      }, { 
        headers: {
          Authorization: session.data?.user.jwtToken
        }
      })
      const data = response.data
      if (data.status >  200) {
        toast.error(data.message)
        toast.dismiss(toastId)
        setIsDisabled(false)
        return
      }

      localStorage.setItem("roomInfo", JSON.stringify({
        roomKey: data.roomKey, 
        quizId: quizId
      }))
      toast.dismiss(toastId)
      toast.success(data.message)
      setIsDisabled(false)
      router.push(`/join/${quizId}`)
      return

    }catch(e) {
      console.log(e)
      toast.dismiss(toastId)
      toast.error('something went wrong')
      setIsDisabled(false)
      return
    }
  }

  const filteredQuizzes = allQuiz.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "active") return matchesSearch && (quiz.quizStatus === "Draft" || quiz.quizStatus === "Created")
    if (activeFilter === "started") return matchesSearch && quiz.quizStatus === "Started"
    if (activeFilter === "ended") return matchesSearch && quiz.quizStatus === "Ended"

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "text-gray-500"
      case "Created": return "text-blue-600"
      case "Started": return "text-green-600"
      case "Ended": return "text-gray-700"
      default: return "text-gray-500"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-orange-500"
      case "CONFIRMED": return "text-green-600"
      case "NO_PAYMENT": return "text-gray-500"
      default: return "text-gray-500"
    }
  }

  const renderActionButton = (quiz: AllQuiz) => {
    if (quiz.PaymentStatus === "PENDING") {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/pay/${quiz.id}`)}
          className="px-4 py-2 bg-[#FAF7FF]/70 text-black border-gray-100 border-2 rounded-lg hover:bg-[#FAF7FF] transition-colors text-sm font-medium"
          disabled={isDisabled}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Pay Now
        </motion.button>
      )
    }

    if (quiz.PaymentStatus === "NO_PAYMENT" && quiz.quizStatus === "Draft" && (quiz.isTemplate === false)) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/edit/${quiz.templateId}`)}
          className="px-3 cursor-pointer py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-24 text-sm font-medium"
          disabled ={isDisabled}
        >
          <Edit className="w-4 h-4 inline mr-1" />
          Edit
        </motion.button>
      )
    }

    if (quiz.PaymentStatus === "CONFIRMED" && quiz.quizStatus === "Draft" && (quiz.isTemplate === false)) {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/edit/${quiz.templateId}`)}
          className="px-3 cursor-pointer py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-24 text-sm font-medium"
          disabled ={isDisabled}
        >
          <Edit className="w-4 h-4 inline mr-1" />
          Edit
        </motion.button>
      )
    }

    if (((quiz.PaymentStatus === "CONFIRMED" || quiz.PaymentStatus === "NO_PAYMENT") && (quiz.quizStatus === "Created" ) )) {
      return (

        
        <div className="flex gap-2">

         {!quiz.isTemplate &&   <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/edit/${quiz.templateId}`)}
            className="px-3 cursor-pointer w-24 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            disabled={isDisabled}
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </motion.button>}
          {
            
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 cursor-pointer py-2 bg-[#FAF7FF] text-black rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
                onClick={() => start(quiz.id)}
                disabled = {isDisabled}
              >
                <Play className="w-4 h-4 inline mr-1" />
                Start
              </motion.button>
            
          }

        </div>
      )
    }

    if (quiz.quizStatus === "Ended") {
      return (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 cursor-pointer bg-[#FAF7FF] text-black rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
          disabled= {isDisabled}
          onClick={() => router.push(`/winners/${quiz.id}`)}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          See Winners
        </motion.button>
      )
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Found</h2>
          <p className="text-gray-600">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-black mb-2">Quiz Dashboard</h1>
          <p className="text-gray-600">Manage and monitor your quizzes</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
        >


          {/* Filter tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {filterCategories.map((category) => (
              <motion.button
                key={category.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(category.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium  ${activeFilter === category.key
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                  }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter + searchTerm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg "
              >
                {/* Quiz header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-medium ${getStatusColor(quiz.quizStatus)}`}>
                        {quiz.quizStatus}
                      </span>
                      {quiz.isPrizePool && (
                        <span className="flex items-center text-yellow-600">
                          <Trophy className="w-3 h-3 mr-1" />
                          Prize
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${getPaymentStatusColor(quiz.PaymentStatus)}`}>
                      {quiz.PaymentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {quiz.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-black">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex justify-end">
                  {renderActionButton(quiz)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">No quizzes found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}