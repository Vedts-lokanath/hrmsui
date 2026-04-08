import { useCallback, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import {
  getFormModulesList,
  getFormRoleAccessList,
  getRolesList,
  updateFormRoleAccess,
} from "../../service/admin.service";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../component/admin/ToggleSwitchbtn.module.css";
import Select from "react-select";


const FormRoleAccess = () => {
  const [formRoleAccessList, setFormRoleAccessList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [formModulesList, setFormModulesList] = useState([]);
  const [initialValues, setInitialValues] = useState({
    selectedRole: null,
    selectedFormModule: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const rolesListResponse = await getRolesList();
      const rolesArr = Array.isArray(rolesListResponse)
        ? rolesListResponse
        : Array.isArray(rolesListResponse)
          ? rolesListResponse
          : [];
      setRolesList(rolesArr);
      const formModulesList = await getFormModulesList();
      setFormModulesList(formModulesList);

      const roleOptions = Array.isArray(rolesArr)
        ? rolesArr.map((r) => ({ value: r.roleId, label: r.roleName }))
        : [];
      // Try to find the role with name 'role_admin' (case-insensitive)
      const defaultRole =
        roleOptions.find((r) => r.label && r.label.toLowerCase() === "role_admin") ||
        (roleOptions.length > 0 ? roleOptions[0] : null);
      //console.log('Default Role:', defaultRole);
      const defaultModule = { value: 0, label: "All" };

      const formRoleAccessList = await getFormRoleAccessList(
        defaultRole?.value,
        defaultModule.value
      );
      setFormRoleAccessList(formRoleAccessList);
      setInitialValues({
        selectedRole: defaultRole,
        selectedFormModule: defaultModule,
      });
    } catch (error) {
      console.error(error)
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (values) => {
    const { selectedRole, selectedFormModule } = values;
    try {
      const formRoleAccessList = await getFormRoleAccessList(
        selectedRole,
        selectedFormModule
      );
      setFormRoleAccessList(formRoleAccessList);
    } catch (error) {
      console.error(error)
    }
  };

  const handleFieldChange = async (field, option, values) => {
    const value = option?.value;
    const newValues = { ...values, [field]: value };
    const { selectedRole, selectedFormModule } = newValues;
    const updatedValues = { selectedRole: selectedRole?.value ?? selectedRole, selectedFormModule: selectedFormModule?.value ?? selectedFormModule }

    await handleSubmit(updatedValues);
  };

  const handleSwitchChange = async (
    index,
    formDetailId,
    formRoleAccessId,
    selectedRole1,
    action,
    values
  ) => {
    const item = formRoleAccessList[index];
    const newIsActive = action === "View" ? !item.active : item.active;
    let newForView = action === "View" ? !item.forView : item.forView;
    let newForAdd = action === "Add" ? !item.forAdd : item.forAdd;
    let newForEdit = action === "Edit" ? !item.forEdit : item.forEdit;
    let newForDelete = action === "Delete" ? !item.forDelete : item.forDelete;

    try {

      if (action === "View" && !newForView) {
        newForAdd = false;
        newForEdit = false;
        newForDelete = false;
      }
      if (newForAdd || newForEdit || newForDelete) {
        newForView = true;
      }


      await updateFormRoleAccess(
        formRoleAccessId,
        newIsActive,
        newForView,
        newForAdd,
        newForEdit,
        newForDelete,
        formDetailId,
        selectedRole1
      );

      // const updatedList = [...formRoleAccessList];
      // updatedList[index] = {
      //   ...item,
      //   active: newIsActive,
      //   forView: newForView,
      //   forAdd: newForAdd,
      //   forEdit: newForEdit,
      //   forDelete: newForDelete
      // };

      const { selectedRole, selectedFormModule } = values;
      const updatedValues = { selectedRole: selectedRole?.value ?? selectedRole, selectedFormModule: selectedFormModule?.value ?? selectedFormModule }

      const updatedList = await getFormRoleAccessList(updatedValues?.selectedRole, updatedValues?.selectedFormModule);
      setFormRoleAccessList(updatedList);
    } catch (error) {
      console.error("Error updating form role access:", error);
    }
  };

  const roleListForOptions = rolesList.map((role) => ({
    value: role.roleId,
    label: role.roleName,
  }));
  const formModuleOptions = [
    { value: 0, label: "All" },
    ...formModulesList.map((module) => ({
      value: module.formModuleId,
      label: module.formModuleName,
    })),
  ];

  const columns = [
    { name: "SN", selector: (row) => row.sn, align: 'text-center', sortable: true },
    { name: "Form Name", selector: (row) => row.formDispName, sortable: true },
    { name: "For View", selector: (row) => row.view },
    { name: "For Add", selector: (row) => row.add },
    { name: "For Edit", selector: (row) => row.edit },
    { name: "For Delete", selector: (row) => row.delete },
  ];

  return (<div>
    <Navbar />
    <div className="container-fluid p-3">

      <div>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {
            const mappedData = formRoleAccessList.map((item, index) => ({
              sn: index + 1,
              formDispName: item.formDispName || "-",
              view:
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={item.forView}
                    onChange={() =>
                      handleSwitchChange(
                        index,
                        item.formDetailId,
                        item.formRoleAccessId,
                        values.selectedRole,
                        "View",
                        values
                      )
                    }
                    disabled={item.roleId === 1 && item.forAdd && item.forEdit && item.forDelete && item.forView}
                  />
                  <span className={styles.slider}></span>
                </label>
              ,
              add:
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={item.forAdd}
                    onChange={() =>
                      handleSwitchChange(
                        index,
                        item.formDetailId,
                        item.formRoleAccessId,
                        values.selectedRole,
                        "Add",
                        values
                      )
                    }
                    disabled={item.roleId === 1 && item.forAdd && item.forEdit && item.forDelete && item.forView}
                  />
                  <span className={styles.slider}></span>
                </label>
              ,
              edit:
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={item.forEdit}
                    onChange={() =>
                      handleSwitchChange(
                        index,
                        item.formDetailId,
                        item.formRoleAccessId,
                        values.selectedRole,
                        "Edit",
                        values
                      )
                    }
                    disabled={item.roleId === 1 && item.forAdd && item.forEdit && item.forDelete && item.forView}
                  />
                  <span className={styles.slider}></span>
                </label>
              ,
              delete:
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={item.forDelete}
                    onChange={() =>
                      handleSwitchChange(
                        index,
                        item.formDetailId,
                        item.formRoleAccessId,
                        values.selectedRole,
                        "Delete",
                        values
                      )
                    }
                    disabled={item.roleId === 1 && item.forAdd && item.forEdit && item.forDelete && item.forView}
                  />
                  <span className={styles.slider}></span>
                </label>
              ,
            }));

            return (
              <div>

                <h3 className="fancy-heading mt-1">
                  Form Role Access
                  <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                  </span>
                </h3>

                <Form>
                  <div className="row align-items-center mb-4">
                    <div className=" d-flex justify-content-end gap-5">

                      <div className="col-md-2">
                        <label className="form-label">Select Role</label>
                        <Select
                          options={roleListForOptions}
                          className=" text-start"
                          value={values.selectedRole}
                          onChange={(e) => {
                            setFieldValue("selectedRole", e);
                            handleFieldChange(
                              "selectedRole",
                              e,
                              values
                            );
                          }}
                        />
                      </div>


                      <div className="col-md-2 me-5">
                        <label className="form-label">Select Form Module</label>
                        <Select
                          options={formModuleOptions}
                          className=" text-start"
                          value={formModuleOptions.find(
                            (m) => m.value === values.selectedFormModule
                          )}
                          onChange={(e) => {
                            setFieldValue("selectedFormModule", e);
                            handleFieldChange("selectedFormModule", e, values);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div id="card-body" className="p-2 mt-2">
                    <Datatable columns={columns} data={mappedData} />
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>
    </div>
  </div>
  );
};

export default FormRoleAccess;