"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SelectQuizTemplate } from "./selectQuizTemplate";
import { PaidQuiz } from "./paidQuiz";
import { useCustomQuizStore, usePaidQuizStore, useTemplateQuizStore } from "@/store/createQuiz";
import { createNewTemplateQuiz, createPaidQuiz, createTemplateQuiz } from "@/app/actions/createQuiz";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type QuizType = 'practice' | 'paid'

export function CreateQuizButton() {

    const [open, setOpen] = useState(false)
    const [currentTab, setCurrentTab] = useState<QuizType>("practice")
    const [useExistingQuiz, setUseExistingQuiz] = useState<boolean>(false)
    const { quizTitle, setCustomQuiz } = useCustomQuizStore() 
    const { id} = useTemplateQuizStore()
    const { paidQuizTitle, prize, description} = usePaidQuizStore()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    function setQuiz(e:boolean) {
    setOpen(e)
    setCurrentTab("practice")
  }

  function handleInputCustomQuiz(value: string) { 
    setCustomQuiz(value)
  }

  async function handleCreateQuiz() { 
    const toastId = toast.loading("creating...")
    setIsLoading(true)
    
    if(currentTab == "practice") { 
        if (quizTitle.length <= 0) {
        toast.dismiss(toastId)
        toast.error("quiz title must be provided")
        setIsLoading(false)
        return
    }
        if (useExistingQuiz) {
            if (!id) {
                toast.error('no template selected')
            }
            const response = await createTemplateQuiz(id, quizTitle)    
            if (response.status === 200) {
                toast.dismiss(toastId)
                toast.success(response.message)
                setOpen(false)
                setIsLoading(false)
                router.push("/quizes")
                return
            }
        }else { 
            const response = await createNewTemplateQuiz(quizTitle)
            if (response.status === 200) {
                toast.dismiss(toastId)
                toast.success(response.message)
                setIsLoading(false)
                router.push("/quizes")
                return
            }else { 
                toast.dismiss(toastId)
                toast.error(response.message)
                setIsLoading(false)
                setOpen(false)
                return
            }
        }
    }else {
      
      console.log(typeof prize)
      console.log("int", parseFloat(prize))
        if (paidQuizTitle.length <= 0) {
            toast.dismiss(toastId)
            toast.error("quiz title must be present")
            return
        }
        if (parseFloat(prize) <= 0.1) {
            toast.dismiss(toastId)
            setIsLoading(false)
            toast.error("amount should be greater than 0.1")
            return
        }
        const response = await createPaidQuiz(paidQuizTitle, parseFloat(prize) * LAMPORTS_PER_SOL, description)

        if (response.status === 200) {
            toast.dismiss(toastId)
            toast.success(response.message)
            setIsLoading(false)
            router.push("/quizes")
            return
        }else {
            toast.dismiss(toastId)
            setIsLoading(false)
            toast.error(response.message)
            setOpen(false)
            return
        }
    }
  }
  

     return ( 
         <>
      <Dialog open={open} onOpenChange={(e) => setQuiz(e)}>
        <DialogTrigger asChild>
          <Button variant="default" className="bg-[#FAF7FF] cursor-pointer hover:bg-[#FAF7FF]/50 text-black/60">Create Quiz</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create different types of quizzes to engage your audience
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="practice" className="w-full" onValueChange={(value) => setCurrentTab(value as QuizType)}>
            <TabsList className="grid grid-cols-2 mb-4 gap-x-1 px-1">
              <TabsTrigger value="practice">Practice Quiz</TabsTrigger>
              <TabsTrigger value="paid">Prize Pool</TabsTrigger>
             
            </TabsList>
            
            {/* Practice Quiz Tab */}
            <TabsContent value="practice" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="useExisting" className="text-sm">Use existing quiz template?</Label>
                <Switch 
                  id="useExisting" 
                  checked={useExistingQuiz} 
                  onCheckedChange={setUseExistingQuiz}
                />
              </div>
              
              {useExistingQuiz ? (
                <SelectQuizTemplate/>
              ) : null}
              
              <div className="space-y-2">
                <Label htmlFor="quizTitle">Quiz Title</Label>
                <Input 
                  id="quizTitle" 
                  placeholder="Enter quiz title" 
                  value={quizTitle}
                  onChange={(e) => handleInputCustomQuiz(e.target.value)}
                />
              </div>
            </TabsContent>
            
            {/* Paid Quiz Tab */}
            <PaidQuiz/>
          </Tabs>
          
          <div className="flex justify-end mt-4">
            <Button disabled={isLoading} variant="outline" className="mr-2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={handleCreateQuiz}>
              Create Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
    </>
     )
}