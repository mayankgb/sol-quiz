"use client"

import { getTemplateQuiz } from "@/app/actions/getquiz"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTemplateQuizStore } from "@/store/createQuiz"
import { useEffect, useState } from "react"

interface TemplateQuizData {
    id: string,
    title: string
}

export function SelectQuizTemplate() {

    const { quizTitle, id, setTemplatequizField } = useTemplateQuizStore()
    const [templateQuizData, setTemplateQuizData] = useState<TemplateQuizData[]>([])


        async function fetchData() {
            try {
                const data = await getTemplateQuiz()
                if (data.data) { 
                    const newData: TemplateQuizData[] = data.data.map((value) => { 
                        return { 
                            ...value
                        }
                    })
                    setTemplateQuizData(newData)
                }
            } catch (e) {
                console.log(e)
                return
            }
        }
        async function handleInputChange(value: string) { 
            setTemplatequizField("id", value)
        }
    return (
        <div className="space-y-2">
            <Label htmlFor="quizId">Select Quiz Template</Label>
            <Select

                onOpenChange={async (e) => {
                    if (e) {
                       await fetchData()
                    }

                }}
                onValueChange={(value) => handleInputChange( value)}
            >
                <SelectTrigger onClick={() => console.log("everything is working fine")}>
                    <SelectValue placeholder="Select a quiz template" />
                </SelectTrigger>
                <SelectContent>
                    {templateQuizData.length === 0 ?
                    (
                        <div className="p-2 text-black/40">
                            No data present
                        </div>
                    )
                     :
                     (templateQuizData.map(quiz => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                            {quiz.title}

                        </SelectItem>)
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}