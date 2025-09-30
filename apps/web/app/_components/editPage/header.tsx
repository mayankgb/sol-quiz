"use client"

import { useSearchParamStore, useTemplateTitleStore } from "@/store/store"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTemplateQuizStore } from "@/store/createQuiz"
import { updateQuizStatus } from "@/app/actions/createQuiz"
import { toast } from "sonner"

export function Header() {
    const { title } = useTemplateTitleStore()
    const {input} = useSearchParamStore()
    const router = useRouter()

    async function updateStatus() { 
        const toastId = toast.loading("updating...")
        const response = await updateQuizStatus(input)
        if (response.status === 200) {
            toast.dismiss(toastId)
            toast.success(response.message)
            router.push("/quizes")
            return
        }else { 
            toast.dismiss(toastId)
            toast.error(response.message)
            return
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Section - Brand & Back Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="text-gray-600 cursor-pointer hover:text-black hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        
                        <div className="h-6 w-px bg-gray-300" />
                        
                        <h1 className="text-xl font-semibold text-black tracking-tight">
                            QuizChain
                        </h1>
                    </div>

                    {/* Center Section - Title */}
                    {title && (
                        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                            <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                                <p className="text-sm font-medium text-gray-700">
                                    {title}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Right Section - Buttons */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-600 cursor-pointer hover:text-black hover:bg-gray-100"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                        
                        <Button
                            size="sm"
                            onClick={() => {
                                // Add your save and finish logic here
                                updateStatus()
                            }}
                            className="text-black cursor-pointer border-0 hover:opacity-90"
                            style={{ backgroundColor: '#FAF7FF' }}
                        >
                            Save & Finish
                        </Button>
                    </div>
                </div>
                
                {/* Mobile Title */}
                {title && (
                    <div className="md:hidden pb-3">
                        <div className="px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 inline-block">
                            <p className="text-sm font-medium text-gray-700">
                                {title}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}