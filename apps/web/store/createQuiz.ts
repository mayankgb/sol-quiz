
import { create} from "zustand"

interface TemplateQuiz { 
    id: string, 
    quizTitle: string, 
    setTemplatequizField: <K extends keyof TemplateQuiz >(key: K, value: TemplateQuiz[K]) => void
}

export const useTemplateQuizStore = create<TemplateQuiz>((set) => ({
    id: "", 
    quizTitle: "", 
    setTemplatequizField: (key, value) => set((state) => { 
        return { 
            ...state, 
            [key]: value
        }
    })
}))

interface CustomQuiz { 
    quizTitle: string
    setCustomQuiz: (value: string) => void
}

export const useCustomQuizStore = create<CustomQuiz>((set) => ({ 
    quizTitle: "", 
    setCustomQuiz: (value) => set((state) => {
        return { 
            quizTitle: value
        }
    })
}))


interface PaidQuiz { 
    paidQuizTitle: string, 
    prize: string, 
    description: string
    setPaidQuizField: <K extends keyof PaidQuiz>(key: K, value: PaidQuiz[K]) => void
}

export const usePaidQuizStore = create<PaidQuiz>((set) => ({ 
    paidQuizTitle: "", 
    prize: "", 
    description: "", 
    setPaidQuizField: (key, value) => set((state) => {
        return { 
            ...state, 
            [key]:value
        }
    })
}))


interface CurrentTab { 
    currentTab: string, 
    setCurrentTab: (value: string) => void
}

export const useCurrentTabStore = create<CurrentTab>((set) =>({
    currentTab: "practice", 
    setCurrentTab: (value) => set((state) => ({ 
        currentTab: value
    }))
}))