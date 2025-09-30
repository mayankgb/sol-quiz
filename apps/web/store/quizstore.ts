import { create } from "zustand";

export interface RecentQuiz { 
    id: string, 
    response: number, 
    title: string, 
    questions: number,
    status: "Draft" | "Published" | "Ended", 
    date: string
}


interface RecentQuizStore { 
    quizes: RecentQuiz[]
    setQuiz: (quizes: RecentQuiz[]) => void 
}


export const useRecentQuizStore = create<RecentQuizStore>((set) => ({ 
    quizes: [], 
    setQuiz: (data) => set((state) => ({
        quizes: data
    }))
}))


export interface AllQuiz { 
    id: string, 
    title: string,
    isPrizePool: boolean, 
    PaymentStatus: "PENDING" | "CONFIRMED" | "NO_PAYMENT", 
    quizStatus: "Draft" | "Created" |"Started" | "Ended", 
    templateId: string
}

interface AllQuizStore { 
    allQuiz: AllQuiz[], 
    setAllQuiz: (data: AllQuiz[]) => void

}

export const useAllQuizStore = create<AllQuizStore>((set) => ({
    allQuiz: [], 
    setAllQuiz: (data) => set(() => ({allQuiz: data}))
}))