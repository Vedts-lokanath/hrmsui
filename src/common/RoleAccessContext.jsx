import React, { createContext, useContext, useEffect, useState } from "react";
import { getFormRoleAccessList } from "../service/admin.service";

const RoleAccessContext = createContext();

export const RoleAccessProvider = ({ children }) => {

    const [permissions, setPermissions] = useState([]);

    const roleId = localStorage.getItem("roleId");

    useEffect(() => {
        if (roleId) {
            fetchPermissions(roleId);
        }
    }, [roleId]);

    const fetchPermissions = async (roleId) => {
        try {
            const res = await getFormRoleAccessList(roleId,0);
            setPermissions(res || []);
        } catch (error) {
            console.error("Permission fetch error", error);
        }
    };

    return (
        <RoleAccessContext.Provider value={{ permissions }}>
            {children}
        </RoleAccessContext.Provider>
    );
};

export const useRoleAccess = () => useContext(RoleAccessContext);