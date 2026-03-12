import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import { forwardRequisition, getRequisitionApprovals, recommendRequisition, returnRequisition } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { FaCheckCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { TbArrowBackUp } from "react-icons/tb";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";


const RequisitionApproval = () => {

    const [requisitionFwdList, setRequisitionFwdList] = useState([]);
    const employeeId = localStorage.getItem("empId");
    const [showReturnModal, setShowReutnModal] = useState(false);
    const [returnData, setReturnData] = useState(null);

    useEffect(() => {
        if (employeeId) {
            fetchRequisitionApprovals(employeeId);
        }
    }, []);

    const fetchRequisitionApprovals = async (id) => {
        try {
            const response = await getRequisitionApprovals(id);
            setRequisitionFwdList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Forwarded By", selector: (row) => row.forwardBy, sortable: true, align: 'text-left' },
        { name: "Forward Date", selector: (row) => row.forwardDate, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return requisitionFwdList.map((item, index) => ({
            sn: index + 1,
            requisitionNumber: item.requisitionNumber || "",
            courseName: item.courseName || "-",
            organizer: item.organizer || "-",
            duration: item.duration || "-",
            fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
            toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
            forwardBy: item.forwardByName || "-",
            forwardDate: item.forwardDate ? format(new Date(item.forwardDate), "dd-MM-yyyy hh:mm a") : "-",
            status: <span className="status-badge-modern" onClick={() => handleView(item)}>
                {item.statusName || "Unknown"}
            </span>,
            action: (
                <>
                    <Tooltip id="Tooltip" className='text-white' />
                    {(item.status === 'AF' || item.status === 'AR') && (
                        <>
                            <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleForward(item)}
                                data-tooltip-id="Tooltip"
                                data-tooltip-content="Approve"
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

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            courseName: item.courseName,
            fromDate: item.fromDate,
            toDate: item.toDate
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
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
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
            const confirm = await AlertConfirmation({ title: "Are you sure!", message: '' });
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

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Requisition Approval List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
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

        </div>
    )
}

export default RequisitionApproval;