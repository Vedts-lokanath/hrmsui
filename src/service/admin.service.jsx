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

export const getHeaderModuleList = async (role) => {
  try {
    return (await axios.post(`${API_URL}api/admin/header-module`, role, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getHeaderModuleList:', error);
    throw error;
  }
};

export const getHeaderModuleDetailList = async (role) => {
  try {
    return (await axios.post(`${API_URL}api/admin/header-detail`, role, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
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

export const getFormRoleAccessList = async (roleId, formModuleId) => {
  try {
    const payload = { roleId, formModuleId };
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

export const getAuditStampingList = async (selUser, fromDate,toDate) => {
  try {
    const response = await axios.get(`${API_URL}api/admin/audit-stamping-list`, { params: {selUser,fromDate,toDate }, headers: authHeader() });
   
    return response.data;
  } catch (error) {
    console.error('Error occurred in getAuditStampingList:', error);
    throw error;
  }
};
