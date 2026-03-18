import axios from 'axios';
import { authHeader } from './auth.header';
import config from "../environment/config";
const API_URL = config.API_URL;


export const getCourseDashboardCount = async (startDate, endDate) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/course-count`, {
            params: { startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getCourseDashboardCount():', error);
        throw error;
    }
};

export const getRequisitionDashboardCount = async (startDate, endDate) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/requisition-filter`, {
            params: { startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionDashboardCount():', error);
        throw error;
    }
};

export const getRequisitionUserDashboardCount = async (empId, startDate, endDate) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/user-requisition-filter`, {
            params: { empId, startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionUserDashboardCount():', error);
        throw error;
    }
};