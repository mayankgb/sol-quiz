"use client"

import { EditPageComponent } from "@/app/_components/editPage/editPage"
import { getAllQuestion } from "@/app/actions/getQuestions"
import { useQuestionStore, useSearchParamStore, Question, useTemplateTitleStore } from "@/store/store"
import { use, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, FileQuestion, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function EditPage({ params }: { params: Promise<{ templateId: string }> }) {
    const { templateId } = use(params)
    const { setParams } = useSearchParamStore()
    const { addALlQuestion } = useQuestionStore()
    const [isQuiz, setIsQuiz] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const { setTemplateTitle} = useTemplateTitleStore()

    useEffect(() => {
        async function main() {
            setParams(templateId)
            setIsLoading(true)
            const response = await getAllQuestion(templateId)

            if (!response.data) {
                setIsQuiz(false)
                setIsLoading(false)
                return
            }

            if (response.data.Question.length <= 0) {
                setIsLoading(false)
                setTemplateTitle(response.data.title)
                return
            }

            const newData: Question[] = response.data.Question.map((value) => {
                return {
                    isEditted: false,
                    isCreated: true,
                    questionId: value.id,
                    correctIndex: value.correctIndex,
                    question: value.question,
                    options: value.options.map((op) => {
                        return {
                            option: op.text,
                            id: op.id,
                            index: op.index
                        }
                    })
                }
            })

            addALlQuestion(newData)
            setTemplateTitle(response.data.title)
            setIsLoading(false)
            return
        }
        main()
    }, [templateId])

    return (
        <div className="bg-gray-50 flex flex-col h-screen">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center h-screen"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full"
                                    />
                                    <FileQuestion className="w-8 h-8 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <h3 className="text-xl font-semibold text-black mb-2">Loading Quiz</h3>
                                <p className="text-gray-600 text-sm">Fetching your questions...</p>
                            </motion.div>

                            <motion.div
                                className="flex gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 bg-black rounded-full"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 1, 0.3]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: i * 0.2
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                ) : !isQuiz ? (
                    <motion.div
                        key="no-quiz"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-center h-screen p-4"
                    >
                        <Card className="bg-white border-gray-200 shadow-lg max-w-md w-full">
                            <CardContent className="pt-12 pb-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                    className="mb-6"
                                >
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto border-2 border-gray-200">
                                        <AlertCircle className="w-10 h-10 text-gray-600" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold text-black mb-3">
                                        No Quiz Found
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        We couldn't find a quiz with this ID. It may have been deleted or the ID might be incorrect.
                                    </p>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                        <p className="text-xs text-gray-500 mb-1">Quiz ID</p>
                                        <p className="text-sm font-mono text-gray-700 break-all">
                                            {templateId}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Button
                                            onClick={() => window.location.href = '/'}
                                            className="w-full text-black border-0"
                                            style={{ backgroundColor: '#FAF7FF' }}
                                        >
                                            Go to Home
                                        </Button>
                                        <Button
                                            onClick={() => window.location.reload()}
                                            variant="outline"
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#FBF8FF] flex flex-col h-screen"
                    >
                        <EditPageComponent />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}