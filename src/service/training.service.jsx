import axios from 'axios';
import { authHeader } from './auth.header';
import config from "../environment/config";
const API_URL = config.API_URL;

export const getCalenderList = async (year) => {
    try {
        return (await axios.get(`${API_URL}api/training/calender`, {
            params: { year },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getCalenderList():', error);
        throw error;
    }
};

export const getAgencies = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/agency`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getAgencies():', error);
        throw error;
    }
};

export const addCalenderData = async (formData) => {
    try {
        const response = await axios.post(
            `${API_URL}api/training/add-calendar`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...authHeader()
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding calender", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const calendarFileDownload = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}api/training/calendar-file/${id}`,
            {
                headers: authHeader(),
                responseType: "blob"
            }
        );

        const contentDisposition = response.headers["content-disposition"];
        let fileName = "downloaded_file";

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+?)"?$/);
            if (match) {
                fileName = match[1];
            }
        }

        return {
            data: response.data,
            fileName,
            contentType: response.headers["content-type"]
        };
    } catch (error) {
        return { data: '0' };
    }
};

export const addProgram = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-program`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addProgram():', error);
        throw error;
    }
};

export const editProgram = async (data) => {
    try {
        const response = await axios.put( `${API_URL}api/training/edit-program`, data, { headers: {'Content-Type': 'application/json', ...authHeader() }});
        return response.data;
    } catch (error) {
        console.error("Error updating program", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const addOrganizer = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-organizer`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addOrganizer():', error);
        throw error;
    }
};

export const editOrganizer = async (data) => {
    try {
        const response = await axios.put( `${API_URL}api/training/edit-organizer`, data, { headers: {'Content-Type': 'application/json', ...authHeader() }});
        return response.data;
    } catch (error) {
        console.error("Error updating organizer", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const getPrograms = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/program`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getPrograms():', error);
        throw error;
    }
};

export const addRequisitionData = async (formData) => {
    try {
        const response = await axios.post(
            `${API_URL}api/training/add-requisition`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...authHeader()
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding requisition", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const updateRequisitionData = async (formData) => {
    try {
        const response = await axios.put(
            `${API_URL}api/training/update-requisition`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...authHeader()
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating requisition", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const getRequisitions = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/requisition`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitions():', error);
        throw error;
    }
};

export const getRequisitionById = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/requisition/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionById():', error);
        throw error;
    }
};

export const reqFileDownload = async (reqId, file) => {
    try {
        const response = await axios.get(
            `${API_URL}api/training/req-file/${reqId}/${file}`,
            {
                headers: authHeader(),
                responseType: "blob"
            }
        );

        const contentDisposition = response.headers["content-disposition"];
        let fileName = file;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+?)"?$/);
            if (match) {
                fileName = match[1];
            }
        }

        return {
            data: response.data,
            fileName,
            contentType: response.headers["content-type"]
        };
    } catch (error) {
        return { data: '0' };
    }
};

export const requisitionFeedback = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/requisition-feedback`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in requisitionFeedback():', error);
        throw error;
    }
};

export const getFeedbackList = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/feedback-list`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getFeedbackList():', error);
        throw error;
    }
};