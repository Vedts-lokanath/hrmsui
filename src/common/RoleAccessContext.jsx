import React, { createContext, useContext, useEffect, useState } from "react";
import { getFormRoleAccessList } from "../service/admin.service";

const RoleAccessContext = createContext();

export const RoleAccessProvider = ({ children }) => {

    const [permissions, setPermissions] = useState([]);

    const roleName = localStorage.getItem("roleName");

    useEffect(() => {
        if (roleName) {
            fetchPermissions(roleName);
        }
    }, [roleName]);

    const fetchPermissions = async (role) => {
        try {
            const res = await getFormRoleAccessList(role,"0");
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