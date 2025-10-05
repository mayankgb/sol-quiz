"use client"

import { useEndStateStore } from "@/store/liveQuiz"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"

export function EndPage() {
  const { endstate } = useEndStateStore()
  const router = useRouter()

  // // Dummy data for testing
  // const dummyEndState = {
  //   userPoint: 850,
  //   userName: "mayank",
  //   correctQuestions: 8,
  //   totalQuestions: 10,
  // }

  // const data = dummyEndState

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Branding */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-gray-500 tracking-wide mb-4"
      >
        QuizChain
      </motion.p>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white border border-gray-200 p-6 text-center rounded-2xl shadow-none">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
            className="w-12 h-12 bg-[#FBF8FF] rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Trophy className="w-6 h-6 text-black" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-semibold text-black mb-4"
          >
            Quiz Completed
          </motion.h1>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-6"
          >
            {/* Points */}
            <div className="bg-[#FBF8FF] rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1 uppercase">
                Total Points
              </p>
              <p className="text-xl font-bold text-black">{endstate.userPoint}</p>
            </div>

            {/* Correct Questions */}
            <div className="bg-[#FBF8FF] rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-gray-500" />
                <p className="text-[10px] text-gray-500 uppercase">
                  Correct Answers
                </p>
              </div>
              <p className="text-base font-medium text-black">
                {endstate.correctQuestions}
              </p>
            </div>
          </motion.div>

          {/* Dashboard Button */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full border cursor-pointer border-gray-200 bg-[#FBF8FF] text-black hover:opacity-80"
            >
              Go to Dashboard
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
}
