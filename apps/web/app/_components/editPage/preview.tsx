'use clinet'
import{useQuestionStore, currentQuestionIndexStore } from "@/store/store"
import { motion, AnimatePresence } from "motion/react"

export function Preview() {
    const { questions } = useQuestionStore()
    const { index }  = currentQuestionIndexStore() 
     return ( 
        <motion.div 
                className="bg-white border mb-16 border-slate-300 hover:border-slate-400 w-[50%] h-[70%] rounded-2xl p-6 flex flex-col"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold mb-3 text-black">
                    {questions[index]?.question || "Your question will appear here"}
                </h2>
                
                
                {/* Options in 2x2 grid with reduced height */}
                <div className="grid grid-cols-2 gap-4 mt-auto mb-auto">
                    <AnimatePresence>
                        {(questions[index]?.options || []).map((option, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-3 border border-slate-200 rounded-lg hover:bg-[#FAF7FF] cursor-pointer flex items-center justify-center text-center h-12"
                            >
                                {option.option || `Option ${idx + 1}`}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
     )
}