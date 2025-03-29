import {create} from 'zustand';
import {axiosInstance} from "../utils/axios.js"
import {toast} from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL="http://localhost:5001";

// take input as a function that returns an object
// set is a function that updates the store
export const useAuthStore = create((set,get) => ({
    
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers :[],
    socket:null, 

    checkAuth : async()=>{
        try{
            const res = await axiosInstance.get('/auth/check');
            set({authUser:res.data});
           
            get().connectSocket();
            console.log("after connect");
        }
        catch(error){
            set({authUser:null});
            console.error("error while checkAuth:" ,error);
        }
        finally{
            set({isCheckingAuth:false});
        }
    },

    // connecting connections..
    connectSocket: () => {
        const { authUser, socket } = get(); // Access current state

        if (!authUser || (socket && socket?.connected)) return; // Prevent duplicate connections

        const newSocket = io(BASE_URL,{
            query :{
                userId : authUser._id
            },
        }); // Create a new socket instance
        
        newSocket.connect();

        // Update the socket in the Zustand state
        set({ socket: newSocket });

        newSocket.on("getOnlineUsers",(userId)=>{
            set({onlineUsers:userId});
        });

        console.log("Socket connected:", newSocket.id);
    },

    disconnectSocket :()=>{
        // closing browser also work the same sending the disconnect ...
        if (get().socket?.connected) get().socket.disconnect();
    },

    signup : async (data)=>{
        set({isSigningUp:true});
        try{
            const res = await axiosInstance.post('/auth/signup',data);
            set({authUser:res.data});
            toast.success("Signup successful");
            get().connectSocket();
        }
        catch(error){
            toast.error(error.response.data.message);
            console.error("error while signup:",error);
        }
        finally{
            set({isSigningUp:false});
        }
    },

    login : async(data)=>{
         set({isLoggingIn:true});
        try{
            const res = await axiosInstance.post('/auth/login',data);
            set({authUser:res.data});
            toast.success("Logged in successfully");

            get().connectSocket();
        }
        catch(error){
            toast.error(error.response.data.message);
            console.error("error while login:",error);
        }
        finally{
            set({isLoggingIn:false});
        }
    },

    logout:async()=>{
        try{
            await axiosInstance.post('/auth/logout');
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket;
        }
        catch(error){
            console.error("error while logout:",error);
            toast.error(error.response.data.message);
        }
    },

    updateProfile:async(data)=>{
        set({isUpdatingProfile:true});
        try{
            const res = await axiosInstance.put('/auth/update-profile',data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");
        }
        catch(error){
            toast.error(error.response.data.message);
            console.error("error while updateProfile:",error);
        }
        finally{
            set({isUpdatingProfile:false});
        }
    },

}));