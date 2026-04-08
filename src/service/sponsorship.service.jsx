import axios from 'axios';
import { authHeader } from './auth.header';
import config from "../environment/config";

const API_URL = config.API_URL;

export const getsponsorshipList = async () => {
    try {
        const response = await axios.get(`${API_URL}api/sponsorship`, { 
            headers: { 
                ...authHeader()
            } 
        });
     return response.data;

    } catch (error) {
        console.error('Error occurred in getsponsorshipList():', error);
        throw error;
    }
};

export const addHigherDegree = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/sponsorship/add-sponsorship`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addHigherDegree():', error);
        throw error;
    }
};

export const editHigherDegree = async (data) => {
    try {
        const response = await axios.put(`${API_URL}api/sponsorship/edit-sponorship`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
        return response.data;
    } catch (error) {
        console.error("Error updating program", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const getSponsorshipDataById = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/sponsorship/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getSponsorshipDataById():', error);
        throw error;
    }
};