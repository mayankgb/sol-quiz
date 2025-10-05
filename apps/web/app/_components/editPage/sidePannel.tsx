"use client"


import { Button } from "@/components/ui/button"
import  {useQuestionStore, currentQuestionIndexStore } from "@/store/store";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


export function SidePannel() { 

    const { questions, addQuestion } = useQuestionStore()
    const { index, setIndex} = currentQuestionIndexStore()

    // console.log("question length", questions.length)
    // console.log("current index", index)

    function test(value:number) { 
        console.log("function index", value)
        setIndex(value)
    }



    return ( 
        <div className="bg-[#FBF8FF] h-[90%]">
            <motion.div 
                className="w-60 max-h-[100%] items-center gap-y-3 px-4 flex flex-col"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Button 
                    onClick={() => {
                        console.log("calling")
                        console.log(questions)
                        if (index === -1) {
                            setIndex(0)
                        }
                        addQuestion()
                    }} 
                    className="rounded-full bg-black text-white text-center hover:bg-black/90"
                >
                    + New slide
                </Button>
                <div className="py-3 w-full max-h-[80%] space-y-3 example overflow-y-auto">
                    <AnimatePresence>
                        {index !== -1 && Array.from({ length: questions.length }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => test(i)}
                                className={`bg-white rounded-xl border ${index === i ? 'border-black shadow-md' : 'border-slate-300 hover:border-slate-400'} cursor-pointer h-28 w-full p-3 flex flex-col justify-between`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium truncate w-4/5">
                                        {questions[i]?.question || `Question ${i + 1}`}
                                    </p>
                                    <Menu size={16} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-500">
                                        {questions[i]?.options?.length || 0} options
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}