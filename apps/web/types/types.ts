export interface Option {
    id: string
    text: string, 
    index: number, 
    questionId: string
}
export interface UpdatedQuestion {
    id: string,
    question: string,
    correctIndex: number,
}
export interface UpdatedOption { 
    id: string, 
    index: number, 
    questionId: string, 
    text: string
}