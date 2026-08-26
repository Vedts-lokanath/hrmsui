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
        return (await axios.get(`${API_URL}api/dashboard/requisition`, {
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
        return (await axios.get(`${API_URL}api/dashboard/user-requisition`, {
            params: { empId, startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionUserDashboardCount():', error);
        throw error;
    }
};

export const getRequisitionPending = async (empId, startDate, endDate) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/user-req-pending`, {
            params: { empId, startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionPending():', error);
        throw error;
    }
};

export const getUserEvaluationCount = async (empId, startDate, endDate) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/user-evaluation`, {
            params: { empId, startDate, endDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getUserEvaluationCount():', error);
        throw error;
    }
};

export const getRequisitionUserYearlyTrend = async (empId, years) => {
    try {
        return (await axios.get(`${API_URL}api/dashboard/user/yearly-trend`, {
            params: { empId, years },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionUserYearlyTrend():', error);
        throw error;
    }
};

export const getReportData = async (url) => {
    try {
        return (await axios.get(`${API_URL}api/reports/${url}`, {
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getReportData():', error);
        throw error;
    }
};