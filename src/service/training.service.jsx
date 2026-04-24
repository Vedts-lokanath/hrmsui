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
        return (await axios.get(`${API_URL}api/training/organizer`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
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

export const calendarFileDownload = async (id, fileType) => {
    try {
        const response = await axios.get(
            `${API_URL}api/training/calendar-file/${id}/${fileType}`,
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
        return (await axios.post(`${API_URL}api/training/add-course`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addProgram():', error);
        throw error;
    }
};

export const editProgram = async (data) => {
    try {
        const response = await axios.put(`${API_URL}api/training/edit-course`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
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
        const response = await axios.put(`${API_URL}api/training/edit-organizer`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
        return response.data;
    } catch (error) {
        console.error("Error updating organizer", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const getCourseList = async (orgId) => {
    try {
        return (await axios.get(`${API_URL}api/training/course`, {
            params: { orgId },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getCourseList():', error);
        throw error;
    }
};

export const getCourseTypeList = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/course-type`, {
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getCourseTypeList():', error);
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

export const getRequisitions = async (empId, roleName) => {
    try {
        return (await axios.get(`${API_URL}api/training/requisition`, {
            params: { empId, roleName },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
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
        return (await axios.post(`${API_URL}api/training/requisition-feedback`, data, { headers: { 'Content-Type': 'multipart/form-data', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in requisitionFeedback():', error);
        throw error;
    }
};

export const updateReqFeedback = async (data) => {
    try {
        return (await axios.put(`${API_URL}api/training/update-feedback`, data, { headers: { 'Content-Type': 'multipart/form-data', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in updateReqFeedback():', error);
        throw error;
    }
};

export const acceptReqFeedback = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/accept-feedback`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in acceptReqFeedback():', error);
        throw error;
    }
};

export const getFeedbackList = async (empId, roleName) => {
    try {
        return (await axios.get(`${API_URL}api/training/feedback-list`, {
            params: { empId, roleName },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getFeedbackList():', error);
        throw error;
    }
};

export const getFeedbackById = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/feedback-data/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getFeedbackById():', error);
        throw error;
    }
};

export const getFeedbackPrint = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/feedback-print/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getFeedbackPrint():', error);
        throw error;
    }
};

export const forwardRequisition = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/forward-req`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in forwardRequisition():', error);
        throw error;
    }
};

export const revokeRequisition = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/revoke-req`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in revokeRequisition():', error);
        throw error;
    }
};

export const recommendRequisition = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/recommend-req`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in recommendRequisition():', error);
        throw error;
    }
};

export const returnRequisition = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/return-req`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in returnRequisition():', error);
        throw error;
    }
};

export const getRequisitionPrint = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/requisition-print/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionPrint():', error);
        throw error;
    }
};

export const getRequisitionApprovals = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/req-approval-list`, {
            params: { empId: id },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getRequisitionPrint():', error);
        throw error;
    }
};

export const getReqTransactionList = async (reqId) => {
    try {
        return (await axios.get(`${API_URL}api/training/req-transaction/${reqId}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getReqTransactionList():', error);
        throw error;
    }
};

export const addEvaluation = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-evaluation`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addEvaluation():', error);
        throw error;
    }
};

export const getEvaluationList = async (fromDate, toDate) => {
    try {
        return (await axios.get(`${API_URL}api/training/evaluation`, {
            params: { fromDate, toDate },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getEvaluationList():', error);
        throw error;
    }
};

export const getEvaluationPrint = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/evaluation-print/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getEvaluationPrint():', error);
        throw error;
    }
};

export const getEligibilities = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/eligibility`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getEligibilities():', error);
        throw error;
    }
};

export const addEligible = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-eligible`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addEligible():', error);
        throw error;
    }
};

export const updateEligible = async (data) => {
    try {
        return (await axios.put(`${API_URL}api/training/update-eligible`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in updateEligible():', error);
        throw error;
    }
};

export const feedbackFileDownload = async (feedId, type) => {
    try {
        const response = await axios.get(
            `${API_URL}api/training/feedback-file/${feedId}/${type}`,
            {
                headers: authHeader(),
                responseType: "blob"
            }
        );
        const contentDisposition = response.headers["content-disposition"];
        let fileName = type;
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


export const getReqApprovedList = async () => {
    try {
        return (await axios.get(`${API_URL}api/training/req-approved-list`, {
            params: { roleName: localStorage.getItem("roleName") },
            headers: { 'Content-Type': 'application/json', ...authHeader() }
        })).data;
    } catch (error) {
        console.error('Error occurred in getReqApprovedList():', error);
        throw error;
    }
};

export const forwardToDirector = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/forward-director`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in forwardToDirector():', error);
        throw error;
    }
};

export const approveRequisition = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/approve-req`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in approveRequisition():', error);
        throw error;
    }
};

export const recommendToDFA = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/recommend-dfa`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in recommendToDFA():', error);
        throw error;
    }
};


export const getCepList = async () => {
    try {
        const response = await axios.get(`${API_URL}api/training/cep`, {
            headers: {
                'Content-Type': 'application/json',
                ...authHeader()
            }
        });
        return response.data;

    } catch (error) {
        console.error('Error occurred in getCepList():', error);
        throw error;
    }
};


export const getCepDataById = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/cepById/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getCepDataById():', error);
        throw error;
    }
};


export const addCepData = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-cep`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in AddCepData():', error);
        throw error;
    }
};


export const editCepData = async (data) => {
    try {
        const response = await axios.put(`${API_URL}api/training/edit-cep`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
        return response.data;
    } catch (error) {
        console.error("Error updating program", error);
        return { success: false, message: "Something went wrong" };
    }
};



export const getDistribution = async () => {
    try {
        const response = await axios.get(`${API_URL}api/training/distribution`, {
            headers: {
                'Content-Type': 'application/json',
                ...authHeader()
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error occurred in getDistribution():', error);
        throw error;
    }
};

export const Adddistrubutiondata = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-distributions`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in AdddistributionData():', error);
        throw error;
    }
};

export const EditDistribution = async (data) => {
    try {
        const response = await axios.put(`${API_URL}api/training/edit-distribution`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } });
        return response.data;
    } catch (error) {
        console.error("Error updating program", error);
        return { success: false, message: "Something went wrong" };
    }
};

export const getDistributionByID = async (id) => {
    try {
        return (await axios.get(`${API_URL}api/training/distributionById/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in getDistributionByID():', error);
        throw error;
    }
};

export const addProjectRoleIds = async (data) => {
    try {
        return (await axios.post(`${API_URL}api/training/add-project-role`, data, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
    } catch (error) {
        console.error('Error occurred in addProjectRoleIds():', error);
        throw error;
    }
};

export const updateCalendar = async (formData) => {
    try {
        const response = await axios.put(
            `${API_URL}api/training/update-calendar`,
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