import axios from 'axios';

// we build everthing top of this 
export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api', // the url of our backend
    withCredentials: true, // to send the cookies along with the request
});