import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getEmployees, handleApiError } from "../../service/master.service";
import { getSponsorshipDataById } from "../../service/sponsorship.service";
import Navbar from "../navbar/Navbar";
import Select from "react-select";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { addHigherDegree, editHigherDegree } from "../../service/sponsorship.service";
import { format } from "date-fns";
import AlertConfirmation from "../../common/AlertConfirmation.component";

const HigherDegreeAddEdit = () => {
const navigate = useNavigate();

const location = useLocation();
const degreeType =location.state?.degreeType || location.state?.editData?.degreeType ||"";

const isEdit = location.state?.isEdit || false;
const editData = location.state?.editData || null;

const [employeeList, setEmployeeList] = useState([]);
const roleName = localStorage.getItem("roleName");
const empId = localStorage.getItem("empId");

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees(empId, roleName);
            setEmployeeList(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchSponsorshipData = async (id) => {
    try {
        const response = await getSponsorshipDataById(id);
        const data = response?.data;
        setInitialValues({
            ...data,
            fromDate: data?.fromDate ? new Date(data.fromDate) : null,
            toDate: data?.toDate ? new Date(data.toDate) : null,
        });
    } catch (error) {
        console.error("Error fetching sponsorship:", error);
    }
};

useEffect(() => {
    fetchEmployees();

    if (isEdit && editData?.sponsorshipId) {
        fetchSponsorshipData(editData.sponsorshipId);
    }
}, []);


    const employeeOptions = employeeList.map((emp) => ({
        value: emp.empId,
        label: ((emp.title || "") + ' ' + emp.empName || "").trim(),
        data: emp
    }));


    const [initialValues, setInitialValues] = useState({
        empId: isEdit ? editData?.empId : "",
        designation: isEdit ? editData?.designation : "",
        empNo: isEdit ? editData?.empNo : "",
        division: isEdit ? editData?.division : "",
        desigCadre: isEdit ? editData?.desigCadre : "",
        delegatedPower: isEdit ? editData?.delegatedPower : "",
        subject: isEdit ? editData?.subject : "",
        university: isEdit ? editData?.university : "",
        city: isEdit ? editData?.city : "",
        fromDate: isEdit ? new Date(editData?.fromDate) : null,
        toDate: isEdit ? new Date(editData?.toDate) : null,
        period: isEdit ? editData?.period : "",
        discipline: isEdit ? editData?.discipline : "Regular",
        preference: isEdit ? editData?.preference : "India",
        expenditure: isEdit ? editData?.expenditure : "",
        degreeType: degreeType,
        sponsorshipId: isEdit ? editData?.sponsorshipId : null,
    });


    useEffect(() => {
        if (employeeList.length > 0) {
            if (!isEdit) {
                const firstEmp = employeeList[0];
                setInitialValues((prev) => ({
                    ...prev,
                    empId: firstEmp.empId,
                    designation: firstEmp.empDesigName,
                    empNo: firstEmp.empNo,
                    division: firstEmp.empDivCode,
                    desigCadre: firstEmp.desigCadre || ""
                }));

            } 
            else
                {
                const matchedEmp = employeeList.find(
                    emp => emp.empId === Number(editData?.empId)
                );

                if (matchedEmp) {
                    setInitialValues((prev) => ({
                        ...prev,
                        empId: matchedEmp.empId,
                        designation: matchedEmp.empDesigName,
                        empNo: matchedEmp.empNo,
                        division: matchedEmp.empDivCode,
                        desigCadre: matchedEmp.desigCadre || ""
                    }));
                }
            }
        }
    }, [employeeList]);

        const calculateDuration = (fromDate, toDate, setFieldValue) => {
        if (fromDate && toDate) {
            const diffTime = new Date(toDate) - new Date(fromDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays >= 0) {
                setFieldValue("period", diffDays);
            } else {
                setFieldValue("period", "");
            }
        }
    };

   const validationSchema = Yup.object({

    empId: Yup.string()
        .trim()
        .required("Employee is required"),

    city: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed")
        .required("City is required"),

    period: Yup.number()
        .typeError("Period must be a number")
        .positive("Must be greater than 0")
        .integer("Must be a whole number")
        .required("Period is required"),

    discipline: Yup.string()
        .trim()
        .required("Discipline is required"),

    expenditure: Yup.number()
        .typeError("Expenditure must be a number")
        .positive("Must be greater than 0")
        .required("Expenditure is required"),

    delegatedPower: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed")
        .required("Delegated Power is required"),

    subject: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s.]+$/, "Only alphabets allowed")
        .required("Subject is required"),

    fromDate: Yup.date()
        .required("From Date is required"),

    toDate: Yup.date()
        .required("To Date is required")
        .min(Yup.ref("fromDate"), "To Date must be after From Date"),

    university: Yup.string()
        .trim()
        .matches(/^[A-Za-z\s.]+$/, "Only alphabets allowed")
        .required("University is required"),

    preference: Yup.string()
        .trim()
        .required("Location is required"),
});

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
    const payload = {
                ...values,
                fromDate: format(new Date(values.fromDate), "yyyy-MM-dd"),
                toDate: format(new Date(values.toDate), "yyyy-MM-dd"),
                preference: values.preference,

            };
     const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
            if (!confirm) {
                return;
            }

     const response = isEdit
                ? await editHigherDegree(payload)
                : await addHigherDegree(payload);

            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                navigate(-1);

            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        } finally {
            setSubmitting(false);
        }
        
    };

    return (
        <div>
            <Navbar />
            
                  <h3 className="fancy-heading mt-3">
                     {isEdit ? "Edit" : "Add"} Higher Degree , {degreeType}
            <span className="underline-glow">
                <span className="pulse-dot"></span>
                <span className="pulse-dot"></span>
                <span className="pulse-dot"></span>
            </span>
        </h3>
      

            <div className="p-5">
                <div className="card p-3 shadow-sm border-rounded">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ setFieldValue, values }) => (
                            <Form autoComplete="off">
                                <div className="row g-3 custom-modal-body p-3">
                                    <div className="col-md-3">
                                        <label className="form-label 
                                        ">Employee</label>
                                        <Select
                                            options={employeeOptions}
                                            value={employeeOptions.find(
                                                (item) => item.value === Number(values.empId)
                                            )|| null
                                        }
                                            onChange={(option) => {
                                                if (option) {
                                                    const emp = option.data;
                                                    setFieldValue("empId", emp.empId);
                                                    setFieldValue("designation", emp.empDesigName);
                                                    setFieldValue("empNo", emp.empNo);
                                                    setFieldValue("division", emp.empDivCode);
                                                    setFieldValue("desigCadre", emp.desigCadre || "");
                                                }
                                            }}
                                            isSearchable
                                        />
                                        <ErrorMessage name="empId" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Designation</label>
                                        <Field name="designation" type="text" className="form-control" readOnly disabled />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Emp No.</label>
                                        <Field name="empNo" type="text" className="form-control" readOnly disabled />
                                    </div>

                                    <div className="col-md-2">
                                        <label className="form-label">Division</label>
                                        <Field name="division" type="text" className="form-control" readOnly disabled />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Cadre</label>
                                        <Field name="desigCadre" type="text" className="form-control" readOnly disabled />
                                    </div>


                                    <div className="col-md-3">
                                        <label className="form-label">Delegated Power</label>
                                        <Field name="delegatedPower" type="text" className="form-control" />
                                        <ErrorMessage name="delegatedPower" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Subject</label>
                                        <Field name="subject" type="text" className="form-control" />
                                        <ErrorMessage name="subject" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">University</label>
                                        <Field name="university" type="text" className="form-control" />
                                        <ErrorMessage name="university" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">City</label>
                                        <Field name="city" type="text" className="form-control" />
                                        <ErrorMessage name="city" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">From Date</label>
                                        <DatePicker
                                            id="fromDate"
                                            name="fromDate"
                                            selected={values.fromDate}
                                            onChange={(date) => {
                                                setFieldValue("fromDate", date);
                                                calculateDuration(date, values.toDate, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="fromDate" component="div" className="text-danger small" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">To Date</label>
                                        <DatePicker
                                            id="toDate"
                                            name="toDate"
                                            selected={values.toDate}
                                            onChange={(date) => {
                                                setFieldValue("toDate", date);
                                                calculateDuration(values.fromDate, date, setFieldValue);
                                            }}
                                            className="form-control"
                                            placeholderText="Choose Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            minDate={values.fromDate}
                                            onKeyDown={(event) => event.preventDefault()}
                                        />
                                        <ErrorMessage name="toDate" component="div" className="text-danger small" />
                                    </div>


                                    <div className="col-md-2">
                                        <label className="form-label">Period (In Days)</label>
                                        <Field name="period" type="text" className="form-control" disabled />
                                        <ErrorMessage name="period" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Discipline</label>
                                        <select className="form-select "
                                            name="discipline"
                                            value={values.discipline}
                                            onChange={(e) => setFieldValue("discipline", e.target.value)}
                                        >
                                            <option value="Regular">Regular</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                        <ErrorMessage name="discipline" component="div" className="invalid-msg" />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Location</label>
                                        <select className="form-select"
                                            name="preference"
                                            value={values.preference}
                                            onChange={(e) => setFieldValue("preference", e.target.value)}>
                                            <option value="India">India</option>
                                            <option value="Abroad">Abroad</option>
                                        </select>
                                        <ErrorMessage name="preference" component="div" className="invalid-msg" />
                                    </div>


                                    <div className="col-md-3">
                                        <label className="form-label">Expenditure (₹)</label>
                                        <Field name="expenditure" type="text" className="form-control" />
                                        <ErrorMessage name="expenditure" component="div" className="invalid-msg" />
                                    </div>
                                </div>


                                <div className="text-center mt-2 mb-3">
                                    <button type="submit" className={isEdit ? `update` : `submit`}>
                                         {isEdit ? "Update" : "Submit"} 
                                     </button>

                                    <button
                                        type="button"
                                        className="back"
                                        onClick={() => navigate(-1)}
                                    >
                                        Back
                                    </button>
                                </div>

                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default HigherDegreeAddEdit;