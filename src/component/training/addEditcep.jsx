import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import { getDivisions, getEmployees, handleApiError } from "../../service/master.service";
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import * as Yup from "yup";
import "react-datepicker/dist/react-datepicker.css";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { addCepData, cepFileDownload, editCepData, getCepDataById } from '../../service/training.service';
import Select from "react-select";
import { format } from "date-fns";
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { BsFileEarmark, BsFileEarmarkCheck } from 'react-icons/bs';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';


const AddEditCepComponent = () => {

  const navigate = useNavigate();
  const [divisionList, setDivisionList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const roleName = localStorage.getItem("roleName");
  const empId = localStorage.getItem("empId");

  const divisionOptions = divisionList.map((div) => ({
    label: div.divisionShortName || div.divisionName,
    value: div.divisionId,
  }));

  const location = useLocation();
  const editData = location.state?.cepItem || null;
  const isEdit = !!editData;

  const defaultCepAttachment = {
    attachmentId: null,
    attachmentName: "",
    attachFile: null,
    existingFileName: "",
  };

  const normalizeCepAttachments = (attachments) => {
    if (!Array.isArray(attachments) || attachments.length === 0) {
      return [defaultCepAttachment];
    }

    return attachments.map((item) => ({
      attachmentId: item?.attachmentId ?? null,
      attachmentName: item?.attachmentName ?? "",
      attachFile: null,
      existingFileName: item?.existingFileName ?? "",
    }));
  };

  const [initialValues, setInitialValues] = useState({
    divisionId: editData?.divisionId || null,
    divisionCode: editData?.divisionCode || "",
    fromDate: editData?.fromDate ? new Date(editData.fromDate) : null,
    toDate: editData?.toDate ? new Date(editData.toDate) : null,
    duration: editData?.duration || "",
    noOfParticipants: editData?.noOfParticipants || "",
    totalAmount: editData?.totalAmount || "",
    amountSpent: editData?.amountSpent || "",
    comments: editData?.comments || "",
    courseCoordinatorId: editData?.courseCoordinatorId || null,
    deputyCourseCoordinatorId: editData?.deputyCourseCoordinatorId || null,
    cepAttachments: normalizeCepAttachments(editData?.cepAttachments),
  });


  const validationSchema = Yup.object({

    divisionId: Yup.string()
      .nullable()
      .required("Division is required"),

    fromDate: Yup.date()
      .nullable()
      .typeError("Invalid From Date")
      .required("From Date is required"),

    toDate: Yup.date()
      .nullable()
      .typeError("Invalid To Date")
      .required("To Date is required")
      .min(Yup.ref("fromDate"), "To Date must be after From Date"),

    noOfParticipants: Yup.number()
      .typeError("No. of Participants must be a number")
      .positive("Must be greater than 0")
      .integer("Must be a whole number")
      .required("No. of Participants is required"),

    totalAmount: Yup.number()
      .typeError("Total Amount must be a number")
      .positive("Must be greater than 0")
      .required("Total Amount is required"),

    amountSpent: Yup.number()
      .typeError("Amount Spent must be a number")
      .positive("Must be greater than 0")
      .required("Amount Spent is required")
      .max(Yup.ref('totalAmount'), "Amount spent cannot exceed Total amount"),

    comments: Yup.string()
      .trim()
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment cannot exceed 500 characters")
      .required("Comment is required"),

    courseCoordinatorId: Yup.number()
      .typeError("Course Co-ordinator is required")
      .required("Course Co-ordinator is required"),

    deputyCourseCoordinatorId: Yup.number()
      .typeError("Deputy Course Co-ordinator is required")
      .required("Deputy Course Co-ordinator is required"),

    cepAttachments: Yup.array()
      .min(1, "At least one attachment is required")
      .of(
        Yup.object().shape({
          attachmentName: Yup.string()
            .trim()
            .required("Attachment name is required"),

          attachFile: Yup.mixed()
            .nullable()
            .test(
              "fileRequired",
              "File is required",
              function (value) {
                const { existingFileName } = this.parent;
                if (existingFileName) return true;
                return value !== null && value !== undefined;
              }
            )
        })
      )
  });


  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();

      formData.append("divisionId", values.divisionId || "");
      formData.append("divisionCode", values.divisionCode || "");
      formData.append(
        "fromDate",
        values.fromDate ? format(values.fromDate, "yyyy-MM-dd") : ""
      );
      formData.append(
        "toDate",
        values.toDate ? format(values.toDate, "yyyy-MM-dd") : ""
      );
      formData.append("duration", values.duration || "");
      formData.append("noOfParticipants", values.noOfParticipants || "");
      formData.append("totalAmount", values.totalAmount || "");
      formData.append("amountSpent", values.amountSpent || "");
      formData.append("comments", values.comments || "");
      formData.append(
        "courseCoordinatorId",
        values.courseCoordinatorId || ""
      );
      formData.append(
        "deputyCourseCoordinatorId",
        values.deputyCourseCoordinatorId || ""
      );

      values.cepAttachments.forEach((item, index) => {
        if (item.attachmentId) {
          formData.append(
            `cepAttachments[${index}].attachmentId`,
            item.attachmentId
          );
        }

        formData.append(
          `cepAttachments[${index}].attachmentName`,
          item.attachmentName || ""
        );

        if (item.attachFile) {
          formData.append(
            `cepAttachments[${index}].attachFile`,
            item.attachFile
          );
        }

        if (item.existingFileName) {
          formData.append(
            `cepAttachments[${index}].existingFileName`,
            item.existingFileName
          );
        }
      });

      if (isEdit) {
        formData.append("cepId", editData?.cepId);
      }

      const confirm = await AlertConfirmation({
        title: "Are you sure to submit!",
        message: "",
      });

      if (!confirm) return;

      const response = isEdit
        ? await editCepData(formData)
        : await addCepData(formData);

      if (response && response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.message || (isEdit ? "CEP updated successfully!" : "CEP added successfully!"),
          showConfirmButton: false,
          timer: 1500,
        });

        resetForm();
        navigate("/cep");
      } else {
        Swal.fire("Warning", response?.message || "Something went wrong", "warning");
      }

    } catch (error) {
      console.error("Error:", error);

      Swal.fire("Warning", handleApiError ? handleApiError(error) : "Something went wrong", "warning");

    } finally {
      setSubmitting(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await getDivisions();
      const result = response?.data || [];
      setDivisionList(result.filter(item => item.isActive == 1));
    } catch (error) {
      console.error("Error fetching divisions:", error);
      Swal.fire("Error", "Failed to fetch division data. Please try again later.", "error");
    }
  };

  const calculateDuration = (fromDate, toDate, setFieldValue) => {
    if (fromDate && toDate) {
      const diffTime = new Date(toDate) - new Date(fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays >= 0) {
        setFieldValue("duration", diffDays);
      } else {
        setFieldValue("duration", "");
      }
    }
  };

  const fetchCepDatabyId = async (id) => {
    try {
      const response = await getCepDataById(id);
      const data = response?.data;
      setInitialValues({
        ...data,
        fromDate: data?.fromDate ? new Date(data.fromDate) : null,
        toDate: data?.toDate ? new Date(data.toDate) : null,
        cepAttachments: normalizeCepAttachments(data?.cepAttachments),
      });
    } catch (error) {
      console.error("Error fetching getCepDataById:", error);
    }
  };

  useEffect(() => {
    fetchDivisions();
    fetchEmployees();
    if (isEdit && editData?.cepId) {
      fetchCepDatabyId(editData.cepId);
    }
  }, []);


  const fetchEmployees = async () => {
    try {
      const response = await getEmployees(empId, roleName);
      setEmployeeList(response?.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const employeeOptions = employeeList.map((emp) => ({
    value: emp.empId,
    label: `${emp.empName || ""}${emp.empDesigName ? ", " + emp.empDesigName : ""}`.trim(),
  }));

  const handleDownload = async (id) => {
    let response = await cepFileDownload(id);

    const { data, fileName, contentType } = response;

    if (data === '0') {
      Swal.fire("Error", "File not found", "error");
      return;
    }

    const blob = new Blob([data], { type: contentType });

    if (contentType === "application/pdf") {
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <h3 className="fancy-heading mt-3">
        {isEdit ? "In-House CEP" : "In-House CEP"}
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

            {({ values, handleChange, setFieldValue }) => (

              <Form autoComplete="off">

                <div className="row g-3 custom-modal-body p-3">
                  <div className="col-md-2">
                    <label className="form-label">Division</label>
                    <Select
                      options={divisionOptions}
                      value={
                        divisionOptions.find(
                          (option) => option.value === Number(values.divisionId)
                        ) || null
                      }
                      onChange={(selectedOption) => {
                        setFieldValue("divisionId", selectedOption?.value || null);
                        setFieldValue("divisionCode", selectedOption?.label || "");
                      }}
                      placeholder="Select Division"
                      isSearchable
                      isClearable
                    />
                    <ErrorMessage name="divisionId" component="div" className="text-danger small" />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">From Date</label>
                    <DatePicker
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
                    <label className="form-label">Duration (Days)</label>
                    <Field name="duration" type="number" className="form-control" disabled />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">No Of Participants</label>
                    <Field name="noOfParticipants" type="number" className="form-control" />
                    <ErrorMessage name="noOfParticipants" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">Total Amount</label>
                    <Field name="totalAmount" type="number" className="form-control" />
                    <ErrorMessage name="totalAmount" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-2">
                    <label className="form-label">Amount Spent</label>
                    <Field name="amountSpent" type="number" className="form-control" />
                    <ErrorMessage name="amountSpent" component="div" className="text-danger small" />
                  </div>


                  <div className="col-md-8">
                    <label className="form-label">Comments</label>
                    <Field name="comments" type="text" className="form-control" />
                    <ErrorMessage name="comments" component="div" className="text-danger small" />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Course Co-ordinator</label>
                    <Select
                      options={employeeOptions}
                      value={employeeOptions.find(
                        (option) => option.value === Number(values.courseCoordinatorId)
                      ) || null}
                      onChange={(selectedOption) => {
                        setFieldValue("courseCoordinatorId", selectedOption?.value || null);
                      }}
                      placeholder="Select Course Co-ordinator"
                      isSearchable
                      isClearable
                    />
                    <ErrorMessage name="courseCoordinatorId" component="div" className="text-danger small" />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Deputy Course Co-ordinator</label>
                    <Select
                      options={employeeOptions}
                      value={employeeOptions.find(
                        (option) => option.value === Number(values.deputyCourseCoordinatorId)
                      ) || null}
                      onChange={(selectedOption) => {
                        setFieldValue("deputyCourseCoordinatorId", selectedOption?.value || null);
                      }}
                      placeholder="Select Deputy Course Co-ordinator"
                      isSearchable
                      isClearable
                    />
                    <ErrorMessage name="deputyCourseCoordinatorId" component="div" className="text-danger small" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Attachments</label>

                    <FieldArray name="cepAttachments">
                      {({ push, remove }) => (
                        <div className="container-fluid px-0">
                          {values?.cepAttachments.map((attachment, index) => (
                            <div
                              className="row g-2 mb-3 align-items-start p-3 border rounded bg-white shadow-sm"
                              key={index}
                            >
                              {/* 1. Attachment Label/Name */}
                              <div className="col-md-4">
                                <label className="form-label fw-bold small text-muted">Attachment Name</label>
                                <Field
                                  name={`cepAttachments.${index}.attachmentName`}
                                  placeholder="Enter Document Name"
                                  className="form-control form-control-sm"
                                />
                                <ErrorMessage
                                  name={`cepAttachments.${index}.attachmentName`}
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </div>

                              {/* 2. File Upload Area */}
                              <div className="col-md-6">
                                <label className="form-label fw-bold small text-muted">File Source</label>

                                <div className="border rounded p-2 bg-light">
                                  {attachment.existingFileName ? (

                                    <div className="d-flex align-items-center justify-content-between bg-white p-2 border rounded shadow-sm">
                                      <div className="text-truncate me-2">
                                        <BsFileEarmarkCheck className="text-success me-2" />
                                        <button
                                          type="button"
                                          className="btn btn-link p-0 small text-decoration-none fw-medium text-truncate"
                                          style={{ maxWidth: '200px' }}
                                          onClick={() => handleDownload(attachment.attachmentId)}
                                        >
                                          {attachment.existingFileName}
                                        </button>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm border-0"
                                        onClick={() => setFieldValue(`cepAttachments.${index}.existingFileName`, "")}
                                        title="Replace file"
                                      >
                                        <FaTimes />
                                      </button>
                                    </div>

                                  ) : (

                                    <div>
                                      <input
                                        type="file"
                                        id={`file-input-${index}`}
                                        className="form-control form-control-sm"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => {
                                          const selectedFile = event.currentTarget.files[0];
                                          setFieldValue(`cepAttachments.${index}.attachFile`, selectedFile || null);
                                        }}
                                      />
                                      {attachment.attachFile && (
                                        <div className="mt-1 small text-success d-flex align-items-center">
                                          <FaCheckCircle className="me-1" /> {attachment.attachFile.name}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <ErrorMessage
                                  name={`cepAttachments.${index}.attachFile`}
                                  component="div"
                                  className="text-danger small mt-1"
                                />
                              </div>

                              {/* 3. Action Buttons */}
                              <div className="col-md-2 d-flex align-items-center justify-content-end pt-4 mt-3">
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm me-2"
                                  onClick={() => push({ attachmentId: null, attachmentName: "", attachFile: null, existingFileName: "" })}
                                >
                                  <FaPlus />
                                </button>

                                {values.cepAttachments.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => remove(index)}
                                  >
                                    <FaMinus />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>

                </div>


                <div className="text-center mt-3">
                  <button
                    type="submit"
                    className={`${isEdit ? "update" : "submit"}`}
                  >
                    {isEdit ? "UPDATE" : "SUBMIT"}
                  </button>
                  <button
                    type="button"
                    className="back"
                    onClick={() => navigate("/cep")}
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

export default AddEditCepComponent;