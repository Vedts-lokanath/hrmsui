import axios from 'axios';
import { authHeader } from './auth.header';
import config from "../environment/config";

const API_URL = config.API_URL;


export const authenticationDetails = async (loginData) => {
  try {
    return await axios.post(
      `${API_URL}authenticate`,
      JSON.stringify(loginData),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Error occurred in authenticationDetails:', error);
    throw error;
  }
};

export const getUserManagerList = async () => {
  try {
    const response = await axios.get(
      `${API_URL}api/admin/user-list`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in getUserManagerList:', error);
    throw error;
  }
};

export const getRolesList = async () => {
  try {
    const response = await axios.get(
      `${API_URL}api/admin/roles`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in getRolesList:', error);
    throw error;
  }
};

export const getHeaderModuleList = async (roleName) => {
  try {
    return (await axios.get(`${API_URL}api/admin/header-module`, {
      params: { roleName },
      headers: { 'Content-Type': 'application/json', ...authHeader() }
    })).data;
  } catch (error) {
    console.error('Error occurred in getHeaderModuleList:', error);
    throw error;
  }
};

export const getHeaderModuleDetailList = async (roleName) => {
  try {
    return (await axios.get(`${API_URL}api/admin/header-detail`, {
      params: { roleName },
      headers: { 'Content-Type': 'application/json', ...authHeader() }
    })).data;
  } catch (error) {
    console.error('Error occurred in getHeaderModuleDetailList:', error);
    throw error;
  }
};

export const getFormModulesList = async () => {
  try {
    const response = await axios.post(
      `${API_URL}api/admin/form-modules-list`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in getFormModulesList:', error);
    throw error;
  }
};

export const getFormRoleAccessList = async (roleName, formModuleId) => {
  try {
    const payload = { roleName, formModuleId };
    const response = await axios.post(
      `${API_URL}api/admin/form-role-access-list`,
      payload, // Send as JSON object
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in getFormRoleAccessList:', error);
    throw error;
  }
};


export const updateFormRoleAccess = async (formRoleAccessId, isActive, forView, forAdd, forEdit, forDelete, formDetailsId, roleId) => {
  try {
    const values = {
      formRoleAccessId: formRoleAccessId,
      isActive: isActive,
      forView: forView,
      forAdd: forAdd,
      forEdit: forEdit,
      forDelete: forDelete,
      formDetailId: formDetailsId,
      roleId: roleId?.value,
    };
    const response = await axios.post(
      `${API_URL}api/admin/update-form-role-access`,
      values,
      { headers: { 'Content-Type': 'application/json', ...authHeader() } }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in updateFormRoleAccess:', error);
    throw error;
  }
};


export const getNotifiCount = async () => {
  try {
    return (await axios.get(`${API_URL}api/admin/notification-count`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getNotifiCount:', error);
    throw error;
  }
};


export const getNotifiList = async () => {
  try {
    return (await axios.get(`${API_URL}api/admin/notification-list`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getNotifiList:', error);
    throw error;
  }
};

export const updateNotification = async (notificationId) => {
  try {
    return (await axios.put(`${API_URL}api/admin/update-notification`, {}, { params: { notificationId }, headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in updateNotification:', error);
    throw error;
  }
}

export const getAuditStampingList = async (selUser, fromDate, toDate) => {
  try {
    const response = await axios.get(`${API_URL}api/admin/audit-stamping-list`, { params: { selUser, fromDate, toDate }, headers: authHeader() });

    return response.data;
  } catch (error) {
    console.error('Error occurred in getAuditStampingList:', error);
    throw error;
  }
};

export const updatePassWord = async (data) => {
  try {
    const res = await axios.put(`${API_URL}api/admin/update-password`, data, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
    }
    );
    return res.data;
  } catch (error) {
    console.error('updatePassWord error:', error);
    throw error;
  }
}

export const getHandingOverList = async (fromDate, toDate) => {
  try {
    return (await axios.get(`${API_URL}api/admin/handing-over`, { params: { fromDate, toDate }, headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getHandingOverList():', error);
    throw error;
  }
};

export const insertHandingOver = async (payload) => {
  try {
    return (await axios.post(`${API_URL}api/admin/add-handing-over`, payload, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in insertHandingOver():', error);
    throw error;
  }
};

export const updateHandingOver = async (payload) => {
  try {
    return (await axios.put(`${API_URL}api/admin/update-handing-over`, payload, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in updateHandingOver():', error);
    throw error;
  }
}

export const revokeHandingOver = async (handingOverId) => {
  try {
    return (await axios.put(`${API_URL}api/admin/revoke-handing-over`, {}, { params: { handingOverId }, headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in revokeHandingOver():', error);
    throw error;
  }
}


// Get Cash Limit List
export const getCashLimitList = async () => {
  try {
    const response = await axios.get(
      `${API_URL}api/admin/cash-limit-list`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error occurred in getCashLimitList:", error);
    throw error;
  }
};

// Add Cash Limit
export const addCashLimit = async (cashLimit) => {
  try {
    const response = await axios.post(
      `${API_URL}api/admin/add-cash-limit`,
      cashLimit,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error occurred in addCashLimit:", error);
    throw error;
  }
};

// Update Cash Limit
export const updateCashLimit = async (id, cashLimit) => {
  try {
    const response = await axios.put(
      `${API_URL}api/admin/update-cash-limit/${id}`,
      cashLimit,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error occurred in updateCashLimit:", error);
    throw error;
  }
};

export const getUserManual = async () => {
  try {
    const response = await axios.get(`${API_URL}api/admin/user-manual`, {
      headers: { ...authHeader() },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('getUserManual error:', error);
    throw error;
  }
};

export const getWorkflow = async () => {
  try {
    const response = await axios.get(`${API_URL}api/admin/work-flow`, {
      headers: { ...authHeader() },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('getWorkflow error:', error);
    throw error;
  }
};

