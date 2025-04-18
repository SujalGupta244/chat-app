import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";


export const useChatStore = create((set, get) => ({
    messages: [],
    users : [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,

    getUsers : async() =>{
        set({isUserLoading: true});
        try {
            const res = await axiosInstance.get("/messages/users")
            set({users: res.data})
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isUserLoading: false});
        }
    },

    getMessages: async(userId)=>{
        set({isMessageLoading: true});

        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({message: res.data})
        } catch (error) {
            toast.error(error.response.data.message)   
        }finally{
            set({isMessageLoading: false})
        }
    },

    sendMessage: async(messageData) =>{
        const {selectedUser, messages} = get();
        
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

            set({messages:[...messages, res.data]})
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    setSelectedUser : (selectedUser) => set({selectedUser})
}))
