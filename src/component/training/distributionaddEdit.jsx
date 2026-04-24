import React, { useEffect, useState } from "react"
import Navbar from '../navbar/Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { getEmployees, getProjectList, handleApiError, getProjectByEmpId, getRoleMasterList, addProjectRoleIds } from "../../service/master.service";
import { Adddistrubutiondata, EditDistribution, getDistributionByID } from '../../service/training.service';
import AlertConfirmation from "../../common/AlertConfirmation.component";
import Swal from "sweetalert2";
import { FaPlus, FaMinus } from "react-icons/fa";

const AddEditDistributionComponent = () => {

      const navigate = useNavigate();
      const location = useLocation();

      const editItem = location.state?.item || null;
      const isEdit = !!editItem;

      const [employeeList, setEmployeeList] = useState([]);
      const roleName = localStorage.getItem("roleName");
      const empId = localStorage.getItem("empId");

      const [projectList, setProjectList] = useState([]);
      const [empProjects, setEmpProjects] = useState([]);
      const [roleList, setRoleList] = useState([]);
      const [selectedEmpId, setSelectedEmpId] = useState(null);

      const [projectRows, setProjectRows] = useState([
            { projectCode: "", role: "" }
      ]);

      const existingEmpIds = location.state?.existingEmpIds || [];

      const [intialvalues, setInitialValues] = useState({
            empId: editItem?.empId || null,
            aoEmpId: editItem?.aoEmpId || null,
            roEmpId: editItem?.roEmpId || null,
            techActivity: editItem?.techActivity || "",
            nonTechActivity: editItem?.nonTechActivity || "",

      });


      const validationSchema = Yup.object({
            empId: Yup.number()
                  .nullable()
                  .required("Employee is required"),

            aoEmpId: Yup.number()
                  .nullable()
                  .required("AO Officer is required")
                  .test(
                        "not-same-as-empId",
                        "AO Officer cannot be the same as Employee",
                        function (value) {
                              const { empId } = this.parent;
                              return !value || !empId || value !== empId;
                        }
                  ),

            roEmpId: Yup.number()
                  .nullable()
                  .required("RO Officer is required")
                  .test(
                        "not-same-as-empId",
                        "RO Officer cannot be the same as Employee",
                        function (value) {
                              const { empId } = this.parent;
                              return !value || !empId || value !== empId;
                        }
                  )
                  .test(
                        "not-same-as-aoEmpId",
                        "RO Officer cannot be the same as AO Officer",
                        function (value) {
                              const { aoEmpId } = this.parent;
                              return !value || !aoEmpId || value !== aoEmpId;
                        }
                  ),

            techActivity: Yup.string()
                  .transform((value) => (value ? value.trim() : value))
                  .max(500, "Tech Activity must be at most 500 characters")
                  .required("Tech Activity is required"),

            nonTechActivity: Yup.string()
                  .transform((value) => (value ? value.trim() : value))
                  .max(500, "Non-Tech Activity must be at most 500 characters")
                  .required("Non-Tech Activity is required"),
      });

      useEffect(() => {
            fetchEmployees();
            fetchProjects();
            fetchRole();
      }, []);


      useEffect(() => {
            if (isEdit && editItem?.empId) {
                  fetchProjectAssignData(editItem.empId);
                  setSelectedEmpId(editItem.empId);
            }
      }, [isEdit, editItem]);


      const fetchProjectAssignData = async (empId) => {
            try {
                  const res = await getProjectByEmpId(empId);
                  setEmpProjects(res?.data || []);
            } catch (error) {
                  console.error("Error project assign data :", error);
            }
      };

      const fetchEmployees = async () => {
            try {
                  const response = await getEmployees(empId, roleName);
                  setEmployeeList(response?.data || []);
            } catch (error) {
                  console.error("Error fetching employees:", error);
            }
      };

      const fetchProjects = async () => {
            try {
                  const response = await getProjectList();
                  setProjectList(response?.data || []);
            } catch (error) {
                  console.error("Error fetching projects:", error);
            }
      };

      const fetchRole = async () => {
            try {
                  const response = await getRoleMasterList();
                  setRoleList(response?.data || []);
            } catch (error) {
                  console.error("Error fetching roles:", error);
            }
      };

      const employeeOptions = employeeList.map((emp) => {
            const isAlreadyUsed = existingEmpIds.includes(emp.empId);
            return {
                  value: emp.empId,
                  label: `${emp.empName || ""}${emp.empDesigName ? ", " + emp.empDesigName : ""}`.trim(),
                  isDisabled: isAlreadyUsed
            };
      });

      const officerOptions = employeeList.map((emp) => {
            const prefix = emp.salutation || emp.title || "";

            return {
                  value: emp.empId,
                  label: `${prefix ? prefix + " " : ""}${emp.empName || ""}${emp.empDesigName ? ", " + emp.empDesigName : ""}`.trim(),
            };
      });

      const empProjectIds = new Set(empProjects.map(p => p.projectId));

      const projectOptions = projectList
            .filter(project => !empProjectIds.has(project.projectId))
            .filter((project) => project.projectCode !== "GEN")
            .map(project => ({
                  value: project.projectId,
                  label: `${project.projectCode} - ${project.projectShortName}`,
            }));

      const roleoptions = roleList.map((role) => ({
            value: role.roleMasterId,
            label: role.roleName,
      }));

      const handleSubmit = async (values, { setSubmitting, resetForm }) => {
            try {

                  if (!empProjects || empProjects.length === 0) {
                        Swal.fire("Warning", "Please submit at least one project", "warning");
                        return;
                  }

                  const payload = {
                        ...(isEdit && { distributionId: editItem.distributionId }),
                        empId: values.empId,
                        aoEmpId: values.aoEmpId,
                        roEmpId: values.roEmpId,
                        techActivity: values.techActivity.trim(),
                        nonTechActivity: values.nonTechActivity.trim(),
                  };

                  const confirm = await AlertConfirmation({ title: "Are you sure!", message: "" });
                  if (!confirm) return;

                  const response = isEdit
                        ? await EditDistribution(payload)
                        : await Adddistrubutiondata(payload);

                  if (response && response.success) {
                        Swal.fire({
                              icon: "success",
                              title: "Success",
                              text: response.message || (isEdit ? "Distribution updated successfully!" : "Distribution added successfully!"),
                              showConfirmButton: false,
                              timer: 1500,
                        });
                        resetForm();
                        navigate(-1);
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

      const handleProjectRoleSubmit = async () => {
            if (!selectedEmpId) {
                  Swal.fire("Warning", "Please select an employee", "warning");
                  return;
            }
            if (!projectRows || projectRows.length === 0) {
                  Swal.fire("Warning", "Please add at least one project", "warning");
                  return;
            }
            for (let i = 0; i < projectRows.length; i++) {
                  const row = projectRows[i];
                  if (!row.projectCode) {
                        Swal.fire("Warning", `Please select Project Code in row ${i + 1}`, "warning");
                        return;
                  }
                  if (!row.role) {
                        Swal.fire("Warning", `Please select Role in row ${i + 1}`, "warning");
                        return;
                  }
            }
            const payload = {
                  empId: selectedEmpId,
                  dtoList: projectRows.map(row => ({
                        projectId: row.projectCode,
                        roleId: row.role
                  }))
            };
            try {
                  const confirm = await AlertConfirmation({ title: "Are you sure!", message: "" });
                  if (!confirm) return;

                  const response = await addProjectRoleIds(payload);

                  if (response && response.success) {
                        Swal.fire({
                              icon: "success",
                              title: "Success",
                              text: response.message,
                              showConfirmButton: false,
                              timer: 1500,
                        });
                        fetchProjectAssignData(selectedEmpId);
                  } else {
                        Swal.fire("Error", response?.message, "error");
                  }
            } catch (error) {
                  Swal.fire(
                        "Error",
                        error?.response?.data?.message || "Something went wrong",
                        "error"
                  );
            }
      };
      return (
            <div>
                  <Navbar />
                  <h3 className="fancy-heading mt-3">
                        {isEdit ? "Edit Distribution" : "Add Distribution"}
                        <span className="underline-glow">
                              <span className="pulse-dot"></span>
                              <span className="pulse-dot"></span>
                              <span className="pulse-dot"></span>
                        </span>
                  </h3>

                  <div className="p-5">
                        <div className="row g-3">

                              <div className="col-md-7">
                                    <div className=" form-card p-3 shadow rounded ">
                                          <Formik
                                                initialValues={intialvalues}
                                                validationSchema={validationSchema}
                                                onSubmit={handleSubmit}
                                                enableReinitialize
                                          >
                                                {({ values, setFieldValue, setFieldTouched, isSubmitting }) => (
                                                      <Form autoComplete="off">
                                                            <div className="row g-3 custom-modal-body p-3">


                                                                  <div className="col-md-4">
                                                                        <label className="form-label">Employee</label>
                                                                        <Select
                                                                              options={employeeOptions}
                                                                              value={employeeOptions.find(
                                                                                    (item) => item.value === Number(values.empId)
                                                                              ) || null
                                                                              }

                                                                              onChange={async (selected) => {
                                                                                    const selectedId = selected?.value ?? null;
                                                                                    setFieldValue("empId", selectedId);
                                                                                    setSelectedEmpId(selectedId);
                                                                                    setProjectRows([{ projectCode: "", role: "" }]);
                                                                                    if (selectedId) {
                                                                                          fetchProjectAssignData(selectedId);
                                                                                    } else {
                                                                                          setEmpProjects([]);
                                                                                    }
                                                                              }}
                                                                              onBlur={() => setFieldTouched("empId", true)}
                                                                              isSearchable
                                                                              placeholder="Select Employee"

                                                                              isOptionDisabled={(option) => option.isDisabled}
                                                                              formatOptionLabel={(option) => (
                                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                          <span style={{ color: option.isDisabled ? "#aaa" : "inherit" }}>
                                                                                                {option.label}
                                                                                          </span>
                                                                                          {option.isDisabled && (
                                                                                                <span
                                                                                                      style={{
                                                                                                            fontSize: "12px",
                                                                                                            background: "#fde8c8",
                                                                                                            color: "#b45309",
                                                                                                            borderRadius: "999px",
                                                                                                            padding: "1px 8px",
                                                                                                            marginLeft: "8px",
                                                                                                            fontWeight: 700,
                                                                                                            whiteSpace: "nowrap",
                                                                                                      }}
                                                                                                >
                                                                                                      ✓ Assigned
                                                                                                </span>
                                                                                          )}
                                                                                    </div>
                                                                              )}
                                                                        />
                                                                        <ErrorMessage name="empId" component="div" className="text-danger small" />
                                                                  </div>


                                                                  <div className="col-md-4">
                                                                        <label className="form-label">AO Officer Name</label>
                                                                        <Select
                                                                              options={officerOptions}
                                                                              value={employeeOptions.find(
                                                                                    (item) => item.value === Number(values.aoEmpId)
                                                                              ) || null}
                                                                              onChange={(selected) => setFieldValue("aoEmpId", selected?.value ?? null)}
                                                                              onBlur={() => setFieldTouched("aoEmpId", true)}
                                                                              isSearchable
                                                                              placeholder="Select AO Officer"
                                                                        />
                                                                        <ErrorMessage name="aoEmpId" component="div" className="text-danger small" />
                                                                  </div>


                                                                  <div className="col-md-4">
                                                                        <label className="form-label">RO Officer Name</label>
                                                                        <Select
                                                                              options={officerOptions}
                                                                              value={officerOptions.find(
                                                                                    (item) => item.value === Number(values.roEmpId)
                                                                              ) || null}
                                                                              onChange={(selected) => setFieldValue("roEmpId", selected?.value ?? null)}
                                                                              onBlur={() => setFieldTouched("roEmpId", true)}
                                                                              isSearchable
                                                                              placeholder="Select RO Officer"
                                                                        />
                                                                        <ErrorMessage name="roEmpId" component="div" className="text-danger small" />
                                                                  </div>




                                                                  <div className="col-md-6">
                                                                        <label className="form-label">Tech Activity</label>
                                                                        <Field
                                                                              as="textarea"
                                                                              name="techActivity"
                                                                              className="form-control"
                                                                              onBlur={(e) => {
                                                                                    setFieldValue("techActivity", e.target.value.trim());
                                                                                    setFieldTouched("techActivity", true);
                                                                              }}
                                                                        />
                                                                        <ErrorMessage name="techActivity" component="div" className="text-danger small" />
                                                                  </div>


                                                                  <div className="col-md-6">
                                                                        <label className="form-label">Non-Tech Activity</label>
                                                                        <Field
                                                                              as="textarea"
                                                                              name="nonTechActivity"
                                                                              className="form-control"
                                                                              onBlur={(e) => {
                                                                                    setFieldValue("nonTechActivity", e.target.value.trim());
                                                                                    setFieldTouched("nonTechActivity", true);
                                                                              }}
                                                                        />
                                                                        <ErrorMessage name="nonTechActivity" component="div" className="text-danger small" />
                                                                  </div>

                                                            </div>

                                                            <div className="text-center mt-3">
                                                                  <button type="submit" className={`btn ${isEdit ? "update" : "submit"}`} disabled={isSubmitting}>
                                                                        {isEdit ? "UPDATE" : "SUBMIT"}
                                                                  </button>
                                                                  <button type="button" className="btn back" onClick={() => navigate(-1)}>
                                                                        BACK
                                                                  </button>
                                                            </div>
                                                      </Form>
                                                )}
                                          </Formik>
                                    </div>
                              </div>

                              <div className="col-md-5">
                                    <div className=" form-card p-3 shadow border rounded ">
                                          <div className="custom-modal-body p-2 ">

                                                {empProjects.length > 0 &&
                                                      <>
                                                            <div className="row g-2 fw-bold">
                                                                  <div className="col-md-6">
                                                                        <label className="form-label">Project Code</label>
                                                                  </div>
                                                                  <div className="col-md-6">
                                                                        <label className="form-label">Role</label>
                                                                  </div>
                                                            </div>

                                                            {empProjects.map((project, index) => (
                                                                  <div
                                                                        key={project.projectEmployeeId || index}
                                                                        className="row g-3 mb-3"
                                                                  >
                                                                        <div className="col-md-6">
                                                                              <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    value={project.projectCode || ""}
                                                                                    disabled
                                                                              />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                              <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    value={project.role || ""}
                                                                                    disabled
                                                                              />
                                                                        </div>
                                                                  </div>
                                                            ))}
                                                      </>
                                                }

                                                <div className="col-md-12">
                                                      <div className="p-3 shadow-lg form-card border rounded">
                                                            <div className="p-1">
                                                                  {projectRows.map((row, index) => (
                                                                        <div key={index} className="row g-3 mb-3">

                                                                              <div className="col-md-5">
                                                                                    <Select
                                                                                          options={projectOptions}
                                                                                          value={
                                                                                                projectOptions.find(
                                                                                                      (opt) => opt.value === row.projectCode
                                                                                                ) || null
                                                                                          }
                                                                                          onChange={(selected) => {
                                                                                                const value = selected?.value;
                                                                                                const label = selected?.label;

                                                                                                const isDuplicate = projectRows.some(
                                                                                                      (r, i) => i !== index && r.projectCode === value
                                                                                                );

                                                                                                if (isDuplicate) {
                                                                                                      Swal.fire("Warning", `${label} is already selected!`, "warning");
                                                                                                      return;
                                                                                                }

                                                                                                const updated = [...projectRows];
                                                                                                updated[index].projectCode = value;
                                                                                                setProjectRows(updated);
                                                                                          }}
                                                                                          placeholder="Select Project Code"
                                                                                          isSearchable
                                                                                    />
                                                                              </div>

                                                                              <div className="col-md-6">
                                                                                    <Select
                                                                                          options={roleoptions}
                                                                                          value={
                                                                                                roleoptions.find((opt) => opt.value === row.role) || null
                                                                                          }
                                                                                          onChange={(selected) => {
                                                                                                const updated = [...projectRows];
                                                                                                updated[index].role = selected?.value || "";
                                                                                                setProjectRows(updated);
                                                                                          }}
                                                                                          placeholder="Select Role"
                                                                                          isSearchable
                                                                                    />
                                                                              </div>

                                                                              <div className="col-md-1">
                                                                                    {index === 0 && (
                                                                                          <button
                                                                                                type="button"
                                                                                                className="btn"
                                                                                                onClick={() =>
                                                                                                      setProjectRows([
                                                                                                            ...projectRows,
                                                                                                            { projectCode: "", role: "" }
                                                                                                      ])
                                                                                                }
                                                                                          >
                                                                                                <FaPlus style={{ color: "green" }} />
                                                                                          </button>
                                                                                    )}
                                                                                    {index > 0 && (
                                                                                          <button
                                                                                                type="button"
                                                                                                className="btn"
                                                                                                onClick={() =>
                                                                                                      setProjectRows(
                                                                                                            projectRows.filter((_, i) => i !== index)
                                                                                                      )
                                                                                                }
                                                                                          >
                                                                                                <FaMinus style={{ color: "red" }} />
                                                                                          </button>
                                                                                    )}
                                                                              </div>

                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                </div>

                                                <div align="center">
                                                      <button
                                                            type="button"
                                                            className="btn submit mt-3"
                                                            onClick={() => handleProjectRoleSubmit()}
                                                      >
                                                            SUBMIT
                                                      </button>
                                                </div>

                                          </div>
                                    </div>
                              </div>

                        </div>
                  </div>
            </div>
      );
};

export default AddEditDistributionComponent;