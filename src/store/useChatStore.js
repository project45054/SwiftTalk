import {create} from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../utils/axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create( (set,get)=>({
    messages : [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers : async()=>{
        set({isUsersLoading:true});
        try {
            const response = await axiosInstance.get("/message/users");
            set({users: response.data});
        } catch (error) {
            toast.error("Failed to fetch users");
        }
        finally{
        set({isUsersLoading:false});
        }
    },

    getMessages : async(userId)=>{
        set({isMessagesLoading:true});
        try {
            const response = await axiosInstance.get(`/message/${userId}`);
            set({messages: response.data});
        } catch (error) {
            toast.error("Failed to fetch messages");
        }
        finally{
            set({isMessagesLoading:false});
        }
    },

    sendMessage:async (messageData)=>{
        const {selectedUser,messages} = get();
        try{
            const res = await axiosInstance.post(`/message/sent/${selectedUser._id}`,messageData);
            // updating messages
            set({messages:[...messages,res.data]});
        }
        catch(error){
 
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else if (!error.response) {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error("An unexpected error occurred");
            }
            console.error("Error while sending message:", error.message);
        }
    },

    subscribeToMessages : ()=>{
        const{selectedUser}=get();
        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        // to optimize this laster... 
        // if it is like this , we will get message 
        // socket.on("newMessage",(newMessage)=>{
        //     set({
        //         messages :[...get().messages,newMessage],
        //     })
        // });

        socket.on("newMessage",(newMessage)=>{
            const isMessageSentFromSelectedUser = newMessage.sendI===selectedUser._id;

            if(!isMessageSentFromSelectedUser) return;
            set({
                messages :[...get().messages,newMessage],
            })
        });
        
    },

    unsubscribeFromMessages :()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser : (selectedUser)=>{
        set({selectedUser});
    }

}))