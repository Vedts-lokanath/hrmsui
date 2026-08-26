import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import { getRequisitionApprovals, recommendRequisition, returnRequisition, getApprovedListByEmpId } from "../../service/training.service";
import Swal from "sweetalert2";
import { format, startOfYear } from "date-fns";
import { FaCheckCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { TbArrowBackUp } from "react-icons/tb";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import RequisitionPreview from "./requisitionPreview";
import DatePicker from "react-datepicker";


const RequisitionApproval = () => {

    const [requisitionFwdList, setRequisitionFwdList] = useState([]);
    const [approvedList, setApprovedList] = useState([]);
    const employeeId = localStorage.getItem("empId");
    const [showReturnModal, setShowReutnModal] = useState(false);
    const [returnData, setReturnData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);
    const [selectedTab, setSelectedTab] = useState("forwarded");
    const fromDate = startOfYear(new Date());
    const toDate = new Date();
    const [fromDateSel, setFromDateSel] = useState(fromDate);
    const [toDateSel, setToDateSel] = useState(toDate);


    useEffect(() => {
        if (employeeId) {
            fetchRequisitionApprovals(employeeId);
            fetchApprovedList(employeeId);
        }
    }, [employeeId, fromDateSel, toDateSel]);

    const fetchRequisitionApprovals = async (id) => {
        try {
            const response = await getRequisitionApprovals(id);
            setRequisitionFwdList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };
    const fetchApprovedList = async (id) => {
        try {
            const response = await getApprovedListByEmpId(id, format(fromDateSel, "yyyy-MM-dd"), format(toDateSel, "yyyy-MM-dd"));
            setApprovedList(response?.data || []);
        } catch (error) {
            console.error("Error fetching approved requisitions:", error);
            Swal.fire("Error", "Failed to fetch approved requisition data. Please try again later.", "error");
        }
    };

    const getTextColor = (bg) => {
        if (!bg) return "#000";
        const color = bg.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "#000" : "#fff";
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center', width: '60px' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left', width: '200px' },
        { name: "Participant", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-left' },
        { name: "Designation", selector: (row) => row.designation, sortable: true, align: 'text-center' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center', width: '120px' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center', width: '120px' },
        ...(selectedTab === "forwarded"
            ? [
                {
                    name: "Forwarded By",
                    selector: (row) => row.forwardBy,
                    sortable: true,
                    align: "text-left"
                },
                {
                    name: "Forward Date",
                    selector: (row) => row.forwardDate,
                    sortable: true,
                    align: "text-center"
                }
            ]
            : []),

        ...(selectedTab === "approved"
            ? [
                {
                    name: "Approved Date",
                    selector: (row) => row.approvedDate,
                    sortable: true,
                    align: "text-center"
                }
            ]
            : []),

        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            align: "text-left",
            width: '150px'
        },

        ...(selectedTab === "forwarded"
            ? [
                {
                    name: "Action",
                    selector: (row) => row.action,
                    sortable: true,
                    align: "text-center",
                    width: '120px'
                }
            ]
            : [])
    ];

    const mappedData = () => {
        const listToshow = selectedTab === "forwarded" ? requisitionFwdList : approvedList;
        return listToshow?.map((item, index) => ({
            sn: index + 1,
            requisitionNumber: (
                <button
                    className="btn btn-sm btn-outline-primary fw-semibold"
                    onClick={() => handlePreview(item)}
                >
                    {item.requisitionNumber}
                </button>
            ),
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            forwardBy: item.forwardByName || "-",
            forwardDate: item.forwardDate ? format(new Date(item.forwardDate), "dd-MM-yyyy hh:mm a") : "-",
            approvedDate: item.approvedDate ? format(new Date(item.approvedDate), "dd-MM-yyyy hh:mm a") : "-",
            initiatingOfficer: item.initiatingOfficerName || "-",
            designation: item.empDesigName || "-",
            status:
                <span
                    className="status-badge-modern"
                    onClick={() => handleView(item)}
                    style={{
                        backgroundColor: item.statusColor || "#cceaff",
                        color: getTextColor(item.statusColor),
                        borderColor: item.statusColor || "#dee2e6"
                    }}
                >
                    {item.statusName || "Unknown"}
                </span>,
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {["AF", "SF", "AR", "AS", "CA", "AG"].includes(item.status) && (
                        <>
                            <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleForward(item)}
                                data-tooltip-id="Tooltip"
                                data-tooltip-content={["ROLE_DH", "ROLE_SA_HRT", "ROLE_ADMIN"].includes(localStorage.getItem("roleName")) ? "Forward" : "Recommend"}
                                data-tooltip-place="top"
                            >
                                <FaCheckCircle className="fs-6" />
                            </button>

                            <button
                                className="btn btn-sm btn-danger me-2"
                                onClick={() => handleReturn(item)}
                                data-tooltip-id="Tooltip"
                                data-tooltip-content="Return"
                                data-tooltip-place="top"
                            >
                                <TbArrowBackUp className="fs-5" />
                            </button>
                        </>
                    )}

                </>
            ),
        }));
    }

    const handlePreview = (item) => {
        setShowModal(true);
        setShowReqData(item);
    };

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            courseName: item.courseName,
            fromDate: item.fromDate,
            toDate: item.toDate,
            registrationFee: item.registrationFee,
            isGroup: item.isGroup || "N",
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    };

    const handleReturn = (item) => {
        setShowReutnModal(true);
        setReturnData(item);
    };

    const returnSchema = Yup.object().shape({
        remarks: Yup.string().trim().required("Remarks is required"),
    });

    const handleForward = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: employeeId,
            }
            const confirm = await AlertConfirmation({ title: "Are you sure to forward!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await recommendRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitionApprovals(employeeId);
                fetchApprovedList(employeeId);
                setSelectedTab("approved");
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleReturnSubmit = async (values, { resetForm }) => {
        try {
            const dto = {
                ...returnData,
                remarks: values.remarks,
                actionBy: employeeId,
            }
            const confirm = await AlertConfirmation({ title: "Are you sure to submit!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await returnRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                resetForm();
                setShowReutnModal(false);
                fetchRequisitionApprovals(employeeId);
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };

    const handleChangeTab = (tab) => {
        setSelectedTab(tab);
    };



    return (
        <div>
            <h3 className="fancy-heading mt-3">
                Requisition Approval List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div className="position-relative mt-5">

                {/* Centered Tabs */}
                <div className="d-flex gap-4 justify-content-center">

                    <button
                        type="button"
                        className={`btn position-relative btn-fixed-300 ${selectedTab === "forwarded"
                            ? "btn-warning"
                            : "btn-outline-secondary"
                            } fw-semibold`}
                        onClick={() => handleChangeTab("forwarded")}
                    >
                        Pending Requisition
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {requisitionFwdList.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`btn position-relative btn-fixed-300 ${selectedTab === "approved"
                            ? "btn-success"
                            : "btn-outline-secondary"
                            } fw-semibold`}
                        onClick={() => handleChangeTab("approved")}
                    >
                        Approved Requisition
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {approvedList.length}
                        </span>
                    </button>

                </div>

                {/* Right Side Date Filters */}
                {selectedTab === "approved" && (
                    <div className="position-absolute top-50 end-0 translate-middle-y d-flex gap-3">

                        <div className="d-flex align-items-center">
                            <label className="fw-bold me-2 mb-0 text-nowrap">
                                From :
                            </label>
                            <DatePicker
                                selected={fromDateSel}
                                onChange={(newValue) => setFromDateSel(newValue)}
                                className="form-control"
                                placeholderText="From Date"
                                dateFormat="dd-MM-yyyy"
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                onKeyDown={(event) => event.preventDefault()}
                                portalId="root"
                                popperPlacement="bottom-end"
                            />
                        </div>

                        <div className="d-flex align-items-center">
                            <label className="fw-bold me-2 mb-0 text-nowrap">
                                To :
                            </label>
                            <DatePicker
                                selected={toDateSel}
                                onChange={(newValue) => setToDateSel(newValue)}
                                className="form-control"
                                placeholderText="To Date"
                                dateFormat="dd-MM-yyyy"
                                showYearDropdown
                                showMonthDropdown
                                dropdownMode="select"
                                onKeyDown={(event) => event.preventDefault()}
                                portalId="root"
                                popperPlacement="bottom-end"
                            />
                        </div>

                    </div>
                )}

            </div>



            <div id="card-body" className="p-2 mt-2">
                <Datatable columns={columns} data={mappedData()} />
            </div>


            {showReturnModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowReutnModal(false)}></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">Return for Requisition No : {returnData?.requisitionNumber}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowReutnModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body custom-modal-body">

                                    <Formik
                                        initialValues={{
                                            remarks: "",
                                        }}
                                        validationSchema={returnSchema}
                                        onSubmit={handleReturnSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form autoComplete="off">
                                                <div className="row text-start">
                                                    <div className="col-md-12 mb-3">
                                                        <label className="form-label">Remarks</label>
                                                        <Field
                                                            as="textarea"
                                                            rows={3}
                                                            name="remarks"
                                                            className="form-control"
                                                        />
                                                        <ErrorMessage name="remarks" component="div" className="invalid-msg" />
                                                    </div>
                                                </div>

                                                <div className="text-center mt-2 mb-4">
                                                    <button type="submit" className="submit">
                                                        Submit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="back"
                                                        onClick={() => setShowReutnModal(false)}
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

            {showModal &&
                <RequisitionPreview
                    reqData={reqData}
                    setShowModal={setShowModal}
                />
            }

        </div>
    )
}

export default RequisitionApproval;