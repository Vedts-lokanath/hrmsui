import { useRoleAccess } from "./RoleAccessContext";


export const usePermission = (formName) => {

    const { permissions } = useRoleAccess();

    const formPermission = permissions.find(
        p => p.formDispName === formName
    );

    return {
        canView: formPermission?.forView || false,
        canAdd: formPermission?.forAdd || false,
        canEdit: formPermission?.forEdit || false,
        canDelete: formPermission?.forDelete || false
    };
};