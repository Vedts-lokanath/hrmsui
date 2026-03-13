import Swal from "sweetalert2";
import { reqFileDownload } from "../../service/training.service";
import { format } from "date-fns";

const RequisitionPreview = ({ reqData, setShowModal }) => {

    const handleDownload = async (reqId, file) => {

        let response = await reqFileDownload(reqId, file);

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
            <div className="modal-backdrop show custom-backdrop" onClick={() => setShowModal(false)}></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">

                        <div className="modal-header custom-modal-header">
                            <h5 className="modal-title">Preview of Req No : {reqData?.requisitionNumber}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <div className="container-fluid view-container">
                                <div className="row g-3 text-start">

                                    <div className="col-md-3 view-field">
                                        <span className="view-label">Name of the Course</span>
                                        <div className="view-value">{reqData?.courseName || "-"}</div>
                                    </div>

                                    <div className="col-md-2 view-field">
                                        <span className="view-label">From Date</span>
                                        <div className="view-value">{reqData.fromDate ? format(new Date(reqData.fromDate), "dd-MM-yyyy") : "-"}</div>
                                    </div>

                                    <div className="col-md-2 view-field">
                                        <span className="view-label">To Date</span>
                                        <div className="view-value">{reqData.toDate ? format(new Date(reqData.toDate), "dd-MM-yyyy") : "-"}</div>
                                    </div>

                                    <div className="col-md-2 view-field">
                                        <span className="view-label">Duration</span>
                                        <div className="view-value">{reqData?.duration || "-"} Days</div>
                                    </div>

                                    <div className="col-md-3 view-field">
                                        <span className="view-label">Organized By</span>
                                        <div className="view-value">{reqData?.organizer || "-"}</div>
                                    </div>

                                    <div className="col-md-4 view-field">
                                        <span className="view-label">Reference</span>
                                        <div className="view-value">{reqData?.reference || "-"}</div>
                                    </div>

                                    <div className="col-md-4 view-field">
                                        <span className="view-label">Venue</span>
                                        <div className="view-value">{reqData?.venue || "-"}</div>
                                    </div>

                                    <div className="col-md-4 view-field">
                                        <span className="view-label">Registration Fee</span>
                                        <div className="view-value">
                                            {reqData.registrationFee > 0 ? `₹ ${reqData.registrationFee}` : "Free"}
                                        </div>
                                    </div>

                                    <div className="col-md-4 view-field">
                                        <span className="view-label">
                                            Participant
                                        </span>
                                        <div className="view-value">
                                            {reqData.initiatingOfficerName ? `${reqData?.initiatingOfficerName}, ${reqData?.empDesigName}`
                                                : (reqData.forwardByName || "-")}
                                        </div>
                                    </div>

                                    <div className="col-md-8 view-field">
                                        <span className="view-label">
                                            Feedback / Impact forms / Participation certificate of previous course submitted
                                        </span>
                                        <div className="view-value">
                                            {reqData.isSubmitted === "Y" ? "Yes" : "No"}
                                        </div>
                                    </div>

                                    <div className="col-md-12 view-field">
                                        <span className="view-label">Necessity of course and benefits</span>
                                        <div className="view-value">{reqData?.necessity}</div>
                                    </div>

                                    <div className="col-md-12 view-field">
                                        <span className="view-label">Mode of Payment : {reqData.modeOfPayment}</span>

                                        {reqData.modeOfPayment === "ECS" ? (
                                            <div className="row g-2 mt-1">
                                                <div className="col-md-3 file-item">
                                                    <span>ECS File</span>
                                                    <div className="file-text"
                                                        onClick={() => handleDownload(reqData.requisitionId, reqData.fileEcs)}
                                                    >{reqData.fileEcs || "-"}</div>
                                                </div>

                                                <div className="col-md-3 file-item">
                                                    <span>Cancelled Cheque</span>
                                                    <div className="file-text"
                                                        onClick={() => handleDownload(reqData.requisitionId, reqData.fileCheque)}
                                                    >{reqData.fileCheque || "-"}</div>
                                                </div>

                                                <div className="col-md-3 file-item">
                                                    <span>PAN Card</span>
                                                    <div className="file-text"
                                                        onClick={() => handleDownload(reqData.requisitionId, reqData.filePan)}
                                                    >{reqData.filePan || "-"}</div>
                                                </div>

                                                <div className="col-md-3 file-item">
                                                    <span>Brochure</span>
                                                    <div className="file-text"
                                                        onClick={() => handleDownload(reqData.requisitionId, reqData.fileBrochure)}
                                                    >{reqData?.fileBrochure || "-"}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row g-2 mt-1">
                                                <div className="col-md-8 file-item">
                                                    <span>Reason</span>
                                                    <div className="reason-text">{reqData?.reason || "-"}</div>
                                                </div>

                                                <div className="col-md-4 file-item">
                                                    <span>Brochure</span>
                                                    <div className="file-text"
                                                        onClick={() => handleDownload(reqData.requisitionId, reqData.fileBrochure)}
                                                    >{reqData?.fileBrochure || "-"}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
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

export default RequisitionPreview;