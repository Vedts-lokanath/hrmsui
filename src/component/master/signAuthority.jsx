import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { addYears, format, startOfYear } from "date-fns";
import Navbar from "../navbar/Navbar";
import { ErrorMessage, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import { getEmployees, getSignAuthorityList, getSignAuthorityRoles, handleApiError, insertSignRoleAuthority, updateSignRoleAuthority } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { FaEdit } from "react-icons/fa";
import { usePermission } from "../../common/usePermission";
import { Tooltip } from "react-tooltip";

const SignAuthority = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Sign Authority");

    const [signAuthorityList, setSignAuthorityList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const roleName = localStorage.getItem("roleName");
    const empId = localStorage.getItem("empId");
    const [showModal, setShowModal] = useState(false);
    const [editdata, setEditData] = useState(null);

    const validFromDefault = startOfYear(new Date());
    const validUptoDefault = addYears(validFromDefault, 5);

    useEffect(() => {
        fetchSignAuthorityList();
        fetchEmployees();
        fetchRoles();
    }, []);

    const fetchSignAuthorityList = async () => {
        try {
            const response = await getSignAuthorityList();
            setSignAuthorityList(response?.data || []);
        } catch (error) {
            console.error("Error fetching sign auth list:", error);
            Swal.fire("Error", "Failed to fetch sign auth data. Please try again later.", "error");
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            const res = response?.data || [];
            setEmployeeList(
                res.map((e) => ({
                    value: e.empId,
                    label: `${e.empName}, ${e.empDesigName}`,
                    divisionId: e.divisionId,
                }))
            );
        } catch (error) {
            console.error("Error fetching employees:", error);
            Swal.fire("Error", "Failed to fetch employee data. Please try again later.", "error");
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await getSignAuthorityRoles();
            const res = response?.data || [];
            setRoleList(
                res.map((r) => ({
                    value: r.signAuthRoleId,
                    label: r.signAuthRole,
                    serialNo: r.serialNo,
                }))
            );
        } catch (error) {
            console.error("Error fetching sign auth roles:", error);
            Swal.fire("Error", "Failed to fetch sign auth role data. Please try again later.", "error");
        }
    };


    const [initialValues, setInitialValues] = useState({
        signRoleAuthorityId: "",
        empId: "",
        signAuthRoleId: "",
        divisionId: "",
        validFrom: validFromDefault || null,
        validUpto: validUptoDefault || null,
        serialNo: "",
    });

    const validationSchema = Yup.object({
        empId: Yup.string().required("Officer required"),
        signAuthRoleId: Yup.string().required("Role required"),
        validFrom: Yup.date().required("Valid From required"),
        validUpto: Yup.date()
            .required("Valid Upto required")
            .min(Yup.ref("validFrom"), "Valid Upto cannot be earlier than Valid From"),
    });

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: "text-center" },
        { name: "Authority Name", selector: (row) => row.admin, sortable: true, align: "text-left" },
        { name: "Authority Role", selector: (row) => row.adminRole, sortable: true, align: "text-center" },
        { name: "Authority From", selector: (row) => row.validFrom, sortable: true, align: "text-center" },
        { name: "Authority To", selector: (row) => row.validTo, sortable: true, align: "text-center" },
        { name: "Period Status", selector: (row) => row.periodExpired, sortable: true, align: "text-center" },
        ...(canEdit ? [{ name: "Action", selector: (row) => row.action, sortable: false, align: "text-center", }] : [])
    ];

    const mappedData = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return signAuthorityList.map((item, index) => {
            const validUptoDate = item?.validUpto
                ? new Date(item.validUpto)
                : null;

            const isExpired = validUptoDate && validUptoDate < today;

            return {
                sn: `${index + 1}`,
                admin: `${item?.employeeName},  ${item?.employeeDesignation}` || "-",
                adminRole: item?.signAuthRoleDesc || "-",

                validFrom: item?.validFrom
                    ? format(new Date(item.validFrom), "dd-MM-yyyy")
                    : "-",

                validTo: item?.validUpto
                    ? format(new Date(item.validUpto), "dd-MM-yyyy")
                    : "-",

                periodExpired: (
                    <span style={{ color: isExpired ? "red" : "green", fontWeight: 600 }}>
                        {isExpired ? "Expired" : "Active"}
                    </span>
                ),
                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />
                        <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Edit"
                            data-tooltip-place="top"
                        >
                            <FaEdit className="fs-6" />
                        </button>
                    </>
                ),
            };
        });
    };

    const handleAdd = () => {
        setShowModal(true);
        setEditData(null);
        setInitialValues({
            signRoleAuthorityId: "",
            empId: "",
            signAuthRoleId: "",
            divisionId: "",
            validFrom: validFromDefault || null,
            validUpto: validUptoDefault || null,
            serialNo: "",
        });
    };

    const handleEdit = (item) => {
        setEditData(item);
        setInitialValues({
            signRoleAuthorityId: item.signRoleAuthorityId || "",
            empId: item.empId || "",
            signAuthRoleId: item.signAuthRoleId || "",
            divisionId: item.divisionId || "",
            validFrom: item.validFrom ? new Date(item.validFrom) : "",
            validUpto: item.validUpto ? new Date(item.validUpto) : "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const payload = {
                signRoleAuthorityId: values.signRoleAuthorityId,
                empId: values.empId,
                signAuthRoleId: values.signAuthRoleId,
                divisionId: values.divisionId,
                validFrom: values.validFrom ? format(values.validFrom, "yyyy-MM-dd") : null,
                validUpto: values.validUpto ? format(values.validUpto, "yyyy-MM-dd") : null,
                serialNo: values.serialNo,
            }
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }
            const response = editdata ? await updateSignRoleAuthority(payload) : await insertSignRoleAuthority(payload);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                setShowModal(false);
                fetchSignAuthorityList();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Sign Authority List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd &&
                    <button
                        className="add"
                        onClick={handleAdd}>
                        ADD NEW
                    </button>
                }
            </div>

            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title"><span className="cs-head-text">{editdata ? "Update Sign Authority" : "Add Sign Authority"}</span></h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <Formik
                                        initialValues={initialValues}
                                        enableReinitialize
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values, setFieldValue, isSubmitting }) => (
                                            <Form>
                                                {/* Officer */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-center">
                                                        Officer <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-md-6">
                                                        <Select
                                                            options={employeeList}
                                                            value={
                                                                employeeList.find(
                                                                    (e) => e.value === values.empId
                                                                ) || null
                                                            }
                                                            onChange={(opt) => {
                                                                setFieldValue("empId", opt?.value || "", true);
                                                                setFieldValue("divisionId", opt?.divisionId || "");
                                                            }}
                                                            placeholder="Select Officer"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="empId" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                {/* Role */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-center">
                                                        Role <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="col-md-6">
                                                        <Select
                                                            options={roleList}
                                                            value={
                                                                roleList.find(
                                                                    (r) => r.value === values.signAuthRoleId
                                                                ) || null
                                                            }
                                                            onChange={(opt) => {
                                                                setFieldValue(
                                                                    "signAuthRoleId",
                                                                    opt?.value || ""
                                                                );
                                                                setFieldValue("serialNo", opt?.serialNo || "");
                                                            }}
                                                            placeholder="Select Role"
                                                            isSearchable
                                                        />
                                                        <ErrorMessage name="signAuthRoleId" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                {/* Dates */}
                                                <div className="row mb-3 align-items-center">
                                                    <label className="col-md-4 form-label text-center">
                                                        Validity Period <span className="text-danger">*</span>
                                                    </label>

                                                    <div className="col-md-3">
                                                        <DatePicker
                                                            className="form-control"
                                                            selected={values.validFrom}
                                                            onChange={(d) =>
                                                                setFieldValue("validFrom", d)
                                                            }
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="Valid From"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            popperPlacement="bottom-start"
                                                            popperProps={{
                                                                strategy: "fixed"
                                                            }}
                                                            dropdownMode="select"
                                                            onKeyDown={(e) => e.preventDefault()}
                                                        />
                                                        <ErrorMessage name="validFrom" component="div" className="invalid-msg" />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <DatePicker
                                                            className="form-control"
                                                            selected={values.validUpto}
                                                            onChange={(d) =>
                                                                setFieldValue("validUpto", d)
                                                            }
                                                            dateFormat="dd-MM-yyyy"
                                                            placeholderText="Valid Upto"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            popperPlacement="bottom-start"
                                                            popperProps={{
                                                                strategy: "fixed"
                                                            }}
                                                            minDate={values.validFrom}
                                                            onKeyDown={(e) => e.preventDefault()}
                                                        />
                                                        <ErrorMessage name="validUpto" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button type="submit"
                                                        className={editdata ? `update` : `submit`}
                                                        disabled={isSubmitting}
                                                    >
                                                        {editdata ? "Update" : "Submit"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={() => setShowModal(false)}
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
    );

};

export default SignAuthority;