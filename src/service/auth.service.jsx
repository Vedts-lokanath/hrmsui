import axios from 'axios';
import config from '../environment/config';
import { authHeader } from './auth.header';
import { authenticationDetails } from './admin.service';

const API_URL = config.API_URL;
const LABCODE = config.LABCODE;


export const login = async (username, password) => {
  try {
    let encryptedPassword = btoa(password);

    // Add timestamp to prevent replay attacks
    const timestamp = Date.now();

    const loginData = {
      username: username.trim(),
      // password: ['CAIR', 'VEDTS'].includes(LABCODE) ? password : encryptedPassword,
      password: LABCODE === 'CAIR' ? password : encryptedPassword,
      // timestamp: timestamp
    };

    const response = await authenticationDetails(loginData);



    if (response.data.data.token) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: response.data.data.token,
          username
        })
      );

      const roles = response.data.data.roles || [];
      const hindiRoles = response.data.data.hindiRoles || [];

      const hindiRoleMap = {};

      roles.forEach((role, i) => {
        hindiRoleMap[role] = hindiRoles[i];
      });

      localStorage.setItem('roles', JSON.stringify(response.data.data.roles || []))


      localStorage.setItem("hindiRoleMap", JSON.stringify(hindiRoleMap));

      const emp = await getUserDetails(username);

      localStorage.setItem('username', username);
      localStorage.setItem('loginId', emp?.data.loginId);
      localStorage.setItem('empId', emp?.data.empId);
      localStorage.setItem('empName', emp?.data.empName);
      localStorage.setItem('roleName', emp?.data.roleName);
      localStorage.setItem('designationCode', emp?.data.empDesigName);
      localStorage.setItem('title', emp?.data.title);
      localStorage.setItem('salutation', emp?.data.salutation);
      localStorage.setItem('roleId', emp?.data.roleId);
      localStorage.setItem('hindiEmpDesigName', emp?.data.hindiEmpDesigName)
      localStorage.setItem('hindiEmpName', emp?.data.hindiEmpName)
      localStorage.setItem('hindiRoleName', emp?.data.hindiRoleName)
      localStorage.setItem('hindiSalutation', emp?.data.hindiSalutation)
      localStorage.setItem('hindiTitle', emp?.data.hindiTitle)
      localStorage.setItem('isGroup', emp?.data.isGroup);

      await customAuditStampingLogin(username);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error occurred in login:', error);
    throw error;
  }
};

export const setLocalStorageData = async (username) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {

    localStorage.setItem('roles', JSON.stringify([]))

    const emp = await getUserDetails(username);

    localStorage.setItem('loginId', emp?.data.loginId);
    localStorage.setItem('empId', emp?.data.empId);
    localStorage.setItem('empName', emp?.data.empName);
    localStorage.setItem('roleName', emp?.data.roleName);
    localStorage.setItem('designationCode', emp?.data.empDesigName);
    localStorage.setItem('title', emp?.data.title);
    localStorage.setItem('roleId', emp?.data.roleId);

    await customAuditStampingLogin(username);

  } catch (error) {
    console.error('Error occurred in setLocalStorageData()', error);
    throw error;
  }
};

export const logout = async (logoutType) => {
  const user = getCurrentUser();
  if (user && user.username) {
    try {
      await customAuditStampingLogout(user.username, logoutType);
      // localStorage.clear();
    } catch (error) {
      console.error('Error occurred in logout:', error);
      throw error;
    }
  } else {
    localStorage.clear();
  }
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const getUserDetails = async (username) => {
  if (!username) {
    throw new Error('No user found');
  } try {
    return (await axios.get(`${API_URL}api/master/getUser/${username}`, { headers: { 'Content-Type': 'application/json', ...authHeader() } })).data;
  } catch (error) {
    console.error('Error occurred in getUserDetails():', error);
    throw error;
  }
};

export const customAuditStampingLogin = async (username) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {
    const response = await axios.post(
      `${API_URL}api/admin/custom-audit-stamping-login`,
      username,
      { headers: { 'Content-Type': 'application/json', ...authHeader() } }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in customAuditStampingLogin:', error);
    throw error;
  }
};

export const customAuditStampingLogout = async (username, logoutType) => {
  if (!username) {
    throw new Error('No user found');
  }

  try {
    const response = await axios.post(
      `${API_URL}api/admin/custom-audit-stamping-logout`,
      { username, logoutType },
      { headers: { 'Content-Type': 'application/json', ...authHeader() } }
    );
    return response.data;
  } catch (error) {
    console.error('Error occurred in customAuditStampingLogout:', error);
    throw error;
  }
}

export const getLicense = async () => {
  try {
    const response = await axios.get(
      `${API_URL}api/admin/get-license`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // true / false
  } catch (error) {
    console.error("License API error:", error);
    return false;
  }
};
