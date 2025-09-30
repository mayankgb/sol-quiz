import { create} from "zustand"


interface RoomState { 
    state: boolean, 
    setState: (value: boolean) => void
}

export const useRoomState = create<RoomState>((set) => ({ 
    state: false, 
    setState: (value) => set(() => ({
        state: value
    }))
}))

interface RoomInfo { 
    roomId: string, 
    roomType: "PAID" | "REGULAR", 
    roomKey: number, 
    setRoomInfo: <K extends keyof RoomInfo>(key: K, value: RoomInfo[K]) => void
}

export const useRoomInfoStore = create<RoomInfo>((set) => ({
    roomId: '', 
    roomType: "REGULAR", 
    roomKey: 0, 
    setRoomInfo: (key,value) => set((state) => ({
        ...state, 
        [key]: value
    }))
}))

// roomId: response.roomId,
//             roomType: response.roomType,
//             message: response.message,
//             status: response.status