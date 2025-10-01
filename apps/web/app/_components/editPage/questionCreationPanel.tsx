'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useQuestionStore, currentQuestionIndexStore, useSearchParamStore } from "@/store/store"
import { motion, AnimatePresence } from "motion/react"
import { ChangeEvent } from "react"
import { toast } from "sonner"
import { createQuestion, deleteOption, updateQuestion } from "@/app/actions/createQuiz"
import { Option, UpdatedOption, UpdatedQuestion } from "@/types/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { deleteQuestion } from "@/app/actions/deleteQuiz"



export function QuestionCreationPannel() {
    const { questions, setField, editOption, addOption, addQuestion, removeOption, removeQuestion } = useQuestionStore()
    const { index, setIndex } = currentQuestionIndexStore()
    const { input } = useSearchParamStore()
    function setNewQuestion(e: ChangeEvent<HTMLInputElement>) {

        if (questions[index]?.isCreated) {
            setField(index, "isEditted", true)
        }
        setField(index, "question", e.target.value)
    }

    async function dQuestion() {
        const questionId = questions[index]!.questionId
        const toastId = toast.loading("deleting...")
        const response = await deleteQuestion(input, questionId)
        toast.dismiss(toastId)
        toast.success(response.message)
        removeQuestion(questionId)
    }

    function handleOptionChange(optionId: string, optionIndex: number, e: ChangeEvent<HTMLInputElement>, optionArrayIndex: number) {
        if (questions[index]?.isCreated) {
            setField(index, "isEditted", true)
        }
        const newOption = {
            option: e.target.value,
            id: optionId,
            index: optionIndex
        }
        editOption(index, optionArrayIndex, newOption)
    }

    async function handleIndexChange(e: string) {
        console.log(e)
        console.log("updated Index", questions[index])
        setField(index, "correctIndex", parseInt(e))
        if (questions[index]?.isCreated) {
            setField(index, "isEditted", true)
        }

    }

    async function saveAndContinue() {
        const toastId = toast.loading("saving...")
        const q = questions[index]!

        if (q.isCreated) {
            return
        }

        if (q.question.length <= 0) {
            toast.dismiss(toastId)
            toast.error("question must be present")
            return
        }
        let isValidOption = true
        q.options.map((value) => {
            if (value.option.length <= 0) {
                toast.dismiss(toastId)
                toast.error("please add a valid option")
                isValidOption = false
            }
        })

        if (!isValidOption) {
            toast.dismiss(toastId)
            toast.error("please add a valid option")
            return
        }


        const option: Option[] = q.options.map((value, oindex) => {
            const newOption: Option = {
                index: oindex,
                text: value.option,
                id: value.id,
                questionId: questions[index]!.questionId,
            }
            return newOption
        })
        const response = await createQuestion(q.questionId, q.question, q.correctIndex, input, option)

        if (response.status > 200) {
            toast.dismiss(toastId)
            toast.error(response.message)
            return
        }
        else if (response.status === 200) {
            toast.dismiss(toastId)
            toast.success(response.message)
            console.log(response.data)
            setField(index, "isEditted", false)
            setField(index, "isCreated", true)
            if (index + 1 >= questions.length) {
                addQuestion()
            }
            setIndex(index + 1)
            return
        }
    }

    async function EditAndSave() {
        const toastId = toast.loading("saving...")
        const q = questions[index]

        if (!q) {
            toast.error("question is not present")
            return
        }
        const updatQuestion: UpdatedQuestion = {
            id: q.questionId,
            correctIndex: q.correctIndex,
            question: q.question
        }

        const option: UpdatedOption[] = q.options.map((value, index) => {
            return {
                id: value.id,
                index: value.index,
                questionId: q.questionId,
                text: value.option
            }
        })

        console.log("updated question", updateQuestion)
        console.log("update option", option)

        const response = await updateQuestion(input, updatQuestion, option)
        setField(index, "isEditted", false)

        toast.dismiss(toastId)
        toast.message(response.message)
        return

    }

    async function deleteoption(optionIndex: number, optionId: string, optionArrayIndex: number) {
        const toastId = toast.loading("deleting...")
        const question = questions[index]
        if ((questions[index]?.isCreated)) {
            let correctIndex: number | undefined = undefined
            if (questions[index]?.correctIndex === optionIndex) {
                if (optionArrayIndex === 0) {
                    correctIndex = questions[index].options[1]!.index
                } else {
                    correctIndex = questions[index].options[0]!.index
                }
            }
            const response = await deleteOption(input, questions[index].questionId, optionId, questions[index].correctIndex === optionIndex, correctIndex)
            toast.dismiss(toastId)
            setField(index, "correctIndex", correctIndex ? correctIndex : questions[index]!.correctIndex)
            // setField(index, "isEditted", true)
            console.log(correctIndex)
            console.log("this is the corrrect index", questions[index].correctIndex)
            removeOption(index, optionArrayIndex)
            toast.message(response.message)
        } else {
            removeOption(index, optionArrayIndex)
            console.log("deleted this without is created")
            toast.dismiss(toastId)
            setField(index, "correctIndex", question?.correctIndex === optionIndex ? 0 : question!.correctIndex)
        }

    }
    return (
        <motion.div
            className="bg-white border border-slate-300 w-72 h-[90%] gap-y-4 rounded-3xl flex flex-col pt-4 px-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <div className="pl-2 font-medium text-black">
                Slide {index + 1}
            </div>

            <div className="h-24 flex flex-col justify-between mb-2">
                <Label className="ml-1 mb-1 text-black">Question</Label>
                <Input
                    value={questions[index]?.question}
                    onChange={(e) => setNewQuestion(e)}
                    placeholder="Enter your question"
                    className="mb-2 border-slate-300"
                />
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto">
                <Label className="ml-1 text-black">Options</Label>
                <AnimatePresence>
                    <RadioGroup onValueChange={(e) => handleIndexChange(e)} value={`${questions[index]?.correctIndex}`}>
                        {questions[index]!.options.map((option, oi) => (
                            <motion.div
                                key={oi}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 mb-3"
                            >
                                <RadioGroupItem value={`${option.index}`} id={`option-${oi}`} />
                                <Label htmlFor={`option-${oi}`}>
                                    <Input
                                        value={option.option ? option.option : ``}
                                        onChange={(e) => handleOptionChange(option.id, option.index, e, oi)}
                                        placeholder={`Option ${oi + 1}`}
                                        className="flex-grow border-slate-300"
                                    />
                                </Label>

                                {questions[index]!.options.length > 2 && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="px-2 py-0 border-slate-300"
                                        onClick={() => deleteoption(option.index, option.id, oi)}
                                    >
                                        ×
                                    </Button>
                                )}
                            </motion.div>
                        ))}
                    </RadioGroup>
                </AnimatePresence>

                {questions[index]!.options.length < 4 && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(index, "as")}
                        className="w-full mt-2 border-slate-300 text-black hover:bg-slate-100"
                    >
                        + Add Option
                    </Button>
                )}
            </div>

            <div className="pb-6 pt-2">
                <Button
                    disabled={questions[index]?.isCreated}
                    onClick={saveAndContinue}
                    className="w-full cursor-pointer bg-[#FAF7FF] text-black hover:bg-[#FAF7FF]/90"
                >
                    Save & Continue
                </Button>
            </div>
            <div className="pb-6 pt-2">
                <Button
                    disabled={!(questions[index]?.isEditted)}
                    onClick={EditAndSave}
                    className="w-full bg-[#FAF7FF] text-black hover:bg-[#FAF7FF]/90"
                >
                    Edit & Save
                </Button>
            </div>
            <div className="pb-6 pt-2">
                <Button
                    onClick={() => dQuestion()}
                    className="w-full text-white"
                >
                    Delete question
                </Button>
            </div>
        </motion.div>
    )
}