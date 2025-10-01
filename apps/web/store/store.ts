import { create } from "zustand";
import { v4 as uuid} from "uuid"

export interface Question {
  questionId: string; 
  question: string;
  options: Option[];
  correctIndex: number;
  isEditted: boolean
  isCreated: boolean
}

interface Option { 
    option: string, 
    id: string, 
    index: number
}

interface CurrentQuestionIndex { 
    index: number,  
    setIndex: (index: number) => void
}

interface SearchParams { 
    input: string, 
    setParams: (input: string) => void
}

export const useSearchParamStore = create<SearchParams>((set) => ({
     input: "", 
     setParams: (value) => set((state) => {return {input: value}})
}))

export const currentQuestionIndexStore = create<CurrentQuestionIndex>((set) => ({ 
    index: 0, 
    setIndex: (index) => set((state) => ({ index: index }))
}))

interface QuestionStore {
  questions: Question[];

  setField: <K extends keyof Question>(
    index: number,
    key: K,
    value: Question[K]
  ) => void;

  addOption: (questionIndex: number, option: string) => void;
  removeOption: (questionIndex: number, optionIndex: number) => void;
  editOption: (questionIndex: number, optionIndex: number, option: Option) => void;

  addALlQuestion: (question: Question[]) => void;

  addQuestion: () => void;
  removeQuestion: (questionId: string) => void;
}

export const useQuestionStore = create<QuestionStore>((set) => ({
  questions: [{ 
    questionId: uuid(), 
    question: "", 
    options: [
            {
                option: "", 
                index: 0, 
                id: uuid()
            }, 
            {
                option: "", 
                index: 1, 
                id: uuid()
            }
        ],
    correctIndex: 0, 
    isEditted: false,
    isCreated: false
  }],

  setField: (index, key, value) =>
    set((state) => {
      const updated = [...state.questions];
      updated[index] = { ...updated[index], [key]: value } as Question;
      return { questions: updated };
    }),

  addOption: (questionIndex) =>
    set((state) => {
      const updated = [...state.questions];
      let newIndex = 0
      updated[questionIndex]?.options.map((value) => { 
        if (value.index > newIndex) {
          newIndex = value.index 
        }
      })
      newIndex++
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: [...updated[questionIndex]!.options, { 
          id: uuid(), 
          index: newIndex,
          option: ""
        }],
      } as Question;
      return { questions: updated };
    }),

  removeOption: (questionIndex, optionIndex) =>
    set((state) => {
      const updated = [...state.questions];
      if (updated[questionIndex]!.options.length <=2) {
       return { questions : updated} 
      }
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: updated[questionIndex]!.options.filter(
          (_, idx) => idx !== optionIndex
        ),
      } as Question;
      return { questions: updated };
    }),

  editOption: (questionIndex, optionIndex, option) =>
    set((state) => {
      const updated = [...state.questions];
      const options = [...updated[questionIndex]!.options];
      options[optionIndex] = option;
      updated[questionIndex] = {
        ...updated[questionIndex],
        options,
      } as Question;
      return { questions: updated };
    }),

  addQuestion: () =>
    set((state) => ({
      questions: [
        ...state.questions,
        {
          questionId: uuid(),
          question: "",
          options: [
            {
                option: "", 
                index: 0, 
                id: uuid()
            }, 
            {
                option: "", 
                index: 1, 
                id: uuid()
            }
        ],
          correctIndex: 0,
          isEditted: false,
          isCreated: false
        },
      ],
    })),

  removeQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.questionId !== questionId),
    })),
    addALlQuestion: (data) => set((state) => ({ 
      questions: data
    }))
}));

interface TemplateTitle { 
  title: string,
  setTemplateTitle: (value: string) => void
}

export const useTemplateTitleStore = create<TemplateTitle>((set) => ({ 
  title: "", 
  setTemplateTitle: (value) => set((state) => ({ 
    title: value
  }))
}))