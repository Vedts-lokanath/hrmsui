import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { getRolesList, getUserManagerList } from "../../service/admin.service";
import { Tooltip } from "react-tooltip";
import { FaEdit } from "react-icons/fa";
import Select from "react-select";
import { addUser, existsUsername, getEmployees, getUserById, handleApiError, updateUser } from "../../service/master.service";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";


const UserManagerList = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("User Manager");

    const [roleList, setRoleList] = useState([]);
    const [userManagerList, setUserManagerList] = useState([]);
    const [filteredUserManagerList, setFilteredUserManagerList] = useState([]);
    const [roleId, setRoleId] = useState(0);
    const [employeeList, setEmployeeList] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");


    const [initialValues, setInitialValues] = useState({
        loginId: "",
        username: "",
        empId: "",
        roleId: "",
    });

    useEffect(() => {
        fetchUserManagerList();
        fetchFormRoleList();
        fetchEmployees();
    }, []);

    const fetchUserManagerList = async () => {
        try {
            const userManagerList = await getUserManagerList();
            setUserManagerList(userManagerList?.data || []);
            setFilteredUserManagerList(userManagerList?.data || []);
        } catch (error) {
            console.error("Error occured in usermanager list");
        }
    };

    const fetchFormRoleList = async () => {
        try {
            const roleList = await getRolesList();
            setRoleList(roleList || []);
        } catch (error) {
            console.error("Error occured in role list");
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire("Error", "Failed to fetch employee data. Please try again later.", "error");
        }
    };

    useEffect(() => {
        if (editData != null && Object.keys(editData).length > 0) {
            setInitialValues({
                loginId: editData.loginId || "",
                username: editData.username || "",
                empId: editData.empId || "",
                roleId: editData.roleId || ""
            });
        }
    }, [editData]);

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "User Name", selector: (row) => row.username, sortable: true, align: 'text-center' },
        { name: "Employee Name", selector: (row) => row.employee, sortable: true, align: 'text-start' },
        { name: 'Role Name', selector: (row) => row.rolename, sortable: true, grow: 2, align: 'text-center' },
        { name: "Division", selector: (row) => row.division, sortable: true, align: 'text-center' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return filteredUserManagerList.map((item, index) => ({
            sn: index + 1,
            username: item.username || '-',
            employee: item.employeeName + ', ' + item.designationName || '-',
            rolename: item.roleName || '-',
            division: item.divisionName || '-',
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {canEdit &&
                        <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => { handleEdit(item.loginId) }}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Edit User"
                            data-tooltip-place="top"
                        >
                            <FaEdit className="fs-6" />
                        </button>
                    }
                </>
            ),
        }))
    }

    const handleRoleTypeChange = (roleId) => {
        const selectedRoleId = roleId;
        setRoleId(selectedRoleId);

        // Filter the user manager list based on selected role ID
        const filteredList = selectedRoleId === 0
            ? userManagerList
            : userManagerList.filter(data => data.roleId === selectedRoleId);

        setFilteredUserManagerList(filteredList);
    };

    const handleAdd = () => {
        setShowEditModal(true);
        setInitialValues({
            loginId: "",
            username: "",
            empId: "",
            roleId: ""
        });
        setEditData(null);
    };


    const handleEdit = async (loginId) => {
        const response = await getUserById(loginId);
        setEditData(response?.data);
        setShowEditModal(true);
    };

    const validationSchema = Yup.object({
        username: Yup.string()
            .trim()
            .min(4, "Minimum 4 characters")
            .required("Username is required"),

        empId: Yup.string()
            .required("Employee is required"),

        roleId: Yup.string()
            .required("Role is required"),
    });

    const closeEditModal = () => {
        setShowEditModal(false);
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                setSubmitting(false);
                return;
            }
            const response = editData != null ? await updateUser(values) : await addUser(values);

            if (response.success) {
                Swal.fire("Success", response.message, "success");
                closeEditModal();
                fetchUserManagerList();
                resetForm();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    };

    const roleOptions = [
        { value: 0, label: "All" },
        ...roleList.map((item) => ({
            value: item.roleId,
            label: item.roleName
        }))
    ];

    const roles = roleList.map(data => ({
        value: data?.roleId,
        label: data?.roleName
    }));

    const employeeOptions = employeeList.map(data => ({
        value: data?.empId,
        label: ((data.title || "") + ' ' + data.empName + ", " + (data.empDesigName || "")).trim(),
    }));


    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                User Manager List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="d-flex justify-content-end align-items-center flex-wrap">
                <div className="d-flex align-items-center me-3 mb-2">
                    <label className="font-label fw-bold me-3 mb-0">Role :</label>
                    <div style={{ width: '400px' }} className="text-start">
                        <Select
                            options={roleOptions}
                            value={roleOptions.find((item) => item.value === Number(roleId)) || null}
                            onChange={(selectedOption) => {
                                const selectedValue = selectedOption ? selectedOption.value : 0; // default to 0
                                handleRoleTypeChange(selectedValue);
                            }}
                            placeholder="Select Role"
                            isSearchable
                        />
                    </div>
                </div>
            </div>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}

                {/* <div>
                    <button
                        type="button"
                        className="add mt-2"
                        onClick={handleAdd}
                    >
                        Add New
                    </button>
                </div> */}
            </div>

            {showEditModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={closeEditModal}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title"><span className="cs-head-text">{editData != null ? "Update User" : "Add User"}</span></h5>
                                    <button type="button" className="btn-close" onClick={closeEditModal}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        enableReinitialize
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting, isValid, errors, touched, setFieldTouched, setFieldError }) => (
                                            <Form autoComplete="off">
                                                <div className="row g-3">

                                                    <div className="col-md-3">
                                                        <label className="form-label">Username</label>
                                                        <Field name="username">
                                                            {({ field }) => (
                                                                <input
                                                                    type="text"
                                                                    {...field}
                                                                    disabled={!!editData}
                                                                    className={`form-control ${touched.username && errors.username ? "is-invalid" : ""}`}
                                                                    onBlur={async (e) => {
                                                                        field.onBlur(e);
                                                                        const value = e.target.value.trim();
                                                                        if (value && value.length >= 4 && value !== editData?.username) {
                                                                            try {
                                                                                const res = await existsUsername(value);
                                                                                if (res === true) {
                                                                                    setFieldTouched("username", true, false);
                                                                                    setFieldError("username", "User Name already exists");
                                                                                }
                                                                            } catch (err) {
                                                                                setFieldTouched("username", true, false);
                                                                                setFieldError("username", "Error checking username");
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorMessage name="username" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-5">
                                                        <label className="form-label">Employee</label>
                                                        <Select
                                                            className="cs-select"
                                                            options={employeeOptions}
                                                            value={employeeOptions.find(o => o.value === values.empId)}
                                                            onChange={o => setFieldValue("empId", o?.value || "")}
                                                            isDisabled
                                                        />
                                                        <ErrorMessage name="empId" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">Role</label>
                                                        <Select
                                                            className="cs-select"
                                                            options={roles}
                                                            value={roles.find(o => o.value === values.roleId)}
                                                            onChange={o => setFieldValue("roleId", o?.value || "")}
                                                        />
                                                        <ErrorMessage name="roleId" component="div" className="invalid-msg" />
                                                    </div>

                                                </div>

                                                <div className="text-center mt-4">
                                                    <button type="submit"
                                                        className={editData != null ? "update" : "submit"}
                                                        disabled={isSubmitting || !isValid}
                                                    >
                                                        {editData != null ? "Update" : "Submit"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={closeEditModal}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    )
};

export default UserManagerList;