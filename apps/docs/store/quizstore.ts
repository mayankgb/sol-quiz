import { create } from "zustand";

interface CurrentQuizState { 
    currentState: "LEADERBOARD" | "WAITING" | "STARTED" | 'ENDED'
    setCurrentState: (value: "LEADERBOARD" | "WAITING" | "STARTED" | 'ENDED') => void
}

export const useCurrentQuizStateStore = create<CurrentQuizState>((set) => ({ 
    currentState: "WAITING", 
    setCurrentState: (value) => set((state) => ({ 
        currentState: value
    }))
}))

interface TotalPlayers { 
    totalPlayers: number, 
    setTotalPlayers: (value: number) => void
}

export const useTotalPlayers = create<TotalPlayers>((set) => ({ 
    totalPlayers: 0, 
    setTotalPlayers: (value) => set((state) => ({ 
        totalPlayers: value
    }))
}))

export interface LeaderBoard { 
    participantId: string;
    points: number;
    name: string;
}

interface LeaderBoardStore { 
    leaderBoard: LeaderBoard[]
    userPoints?: number,
    userPosition?: number
    setField: <K extends keyof LeaderBoardStore>(key : K, value: LeaderBoardStore[K]) => void
    setLeaderBoard: (data: LeaderBoard[]) => void
}

export const useLeaderBoardStore = create<LeaderBoardStore>((set) => ({ 
    leaderBoard: [],
    setLeaderBoard: (value) => set((state) => ({
        leaderBoard: value
    })), 
    setField: (key , value) => set((state) => { 
        return { 
            ...state, 
            [key]: value
        }
    })
}))

interface CurrentQuestion { 
    question: string, 
    options: Options[], 
    totalPoints: number, 
    startTime: number, 
    questionId: string
}

interface Options { 
    option:string, 
    index: number
}

interface CurrentQuestionStore { 
    currentQuestion: CurrentQuestion, 
    setCurrentQuestion: (value: CurrentQuestion) => void
}

export const useCurrentQuestionStore  = create<CurrentQuestionStore>((set) => ({ 
    currentQuestion: { 
        question: "", 
        options: [], 
        totalPoints: 0,
        startTime:0, 
        questionId: ""
    }, 
    setCurrentQuestion: (value) => set(() => ({ 
        currentQuestion: value
    }))
}))


export interface EndState { 
    userPoint: number, 
    userName: string, 
    correctQuestions: number,  
}

interface EndStateStore { 
    endstate: EndState
    setEndState: (data: EndState) =>  void
}

export const useEndStateStore = create<EndStateStore>((set) => ({
    endstate: { 
        userName: "", 
        userPoint: 0, 
        correctQuestions: 0
    },
    setEndState: (value) => set(() => ({ 
        endstate: value
    }))
}))


interface UserSocket { 
    ws: WebSocket | null
    setWs: (value: WebSocket) => void
}

export const useUserSocket = create<UserSocket>((set) => ({
    ws: null, 
    setWs: (value) => set((state) => ({
        ws: value
    }))
}))