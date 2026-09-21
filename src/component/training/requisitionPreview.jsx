import Swal from "sweetalert2";
import { reqFileDownload } from "../../service/training.service";
import { format } from "date-fns";
import "./RequisitionPreview.css";

// ---- tiny inline icon set (no extra dependency) ----------------------------
const Icon = ({ name, className = "" }) => {
    const paths = {
        close: "M18 6 6 18M6 6l12 12",
        calendar: "M8 2v3M16 2v3M3.5 9h17M4.5 5h15a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
        clock: "M12 7v5l3.2 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
        pin: "M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
        rupee: "M6 4h12M6 8h12M6 4c5.5 0 8.5 2 8.5 5s-3 5-8.5 5h-1l7 7",
        user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-7 8-7s8 3 8 7",
        building: "M4 21V5a1 1 0 0 1 1-1h5v17M15 21V10h5a1 1 0 0 1 1 1v10M9 7h.01M9 11h.01M9 15h.01M4 21h16",
        file: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6ZM14 2v6h5",
        download: "M12 3v12m0 0-4-4m4 4 4-4M4 21h16",
        check: "m5 12 5 5L20 7",
        cross: "M18 6 6 18M6 6l12 12",
        note: "M9 12h6M9 16h6M9 8h2M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
        award: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM8.2 13.5 6 21l6-3 6 3-2.2-7.5",
    };
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={paths[name] || ""} />
        </svg>
    );
};

const StatusPill = ({ positive, yesLabel = "Yes", noLabel = "No" }) => (
    <span className={`rp-pill ${positive ? "rp-pill--yes" : "rp-pill--no"}`}>
        <Icon name={positive ? "check" : "cross"} />
        {positive ? yesLabel : noLabel}
    </span>
);

const FileChip = ({ label, fileName, onClick }) => (
    <button type="button" className="rp-file-chip" onClick={onClick} disabled={!fileName}>
        <Icon name="file" className="rp-file-chip__icon" />
        <span className="rp-file-chip__body">
            <span className="rp-file-chip__label">{label}</span>
            <span className="rp-file-chip__name">{fileName || "Not uploaded"}</span>
        </span>
        {fileName && <Icon name="download" className="rp-file-chip__dl" />}
    </button>
);

const Section = ({ icon, title, children, className = "" }) => (
    <section className={`rp-section ${className}`}>
        <h6 className="rp-section__title">
            <Icon name={icon} />
            {title}
        </h6>
        {children}
    </section>
);

const RequisitionPreview = ({ reqData, setShowModal }) => {

    const handleDownload = async (reqId, file) => {
        if (!file) return;
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
            <div className="modal-backdrop show rp-backdrop" onClick={() => setShowModal(false)}></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content rp-modal">

                        <div className="modal-header rp-header">
                            <div>
                                <span className="rp-header__eyebrow">Requisition No. {reqData?.requisitionNumber}</span>
                                <h5 className="rp-header__title">{reqData?.courseName || "-"}</h5>
                            </div>
                            <button
                                type="button"
                                className="rp-close"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className="modal-body rp-body">

                            {/* ---- at a glance strip ---- */}
                            <div className="rp-stats">
                                <div className="rp-stat">
                                    <Icon name="calendar" className="rp-stat__icon" />
                                    <div>
                                        <span className="rp-stat__label">From</span>
                                        <span className="rp-stat__value">
                                            {reqData.fromDate ? format(new Date(reqData.fromDate), "dd MMM yyyy") : "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="rp-stat">
                                    <Icon name="calendar" className="rp-stat__icon" />
                                    <div>
                                        <span className="rp-stat__label">To</span>
                                        <span className="rp-stat__value">
                                            {reqData.toDate ? format(new Date(reqData.toDate), "dd MMM yyyy") : "-"}
                                        </span>
                                    </div>
                                </div>
                                <div className="rp-stat">
                                    <Icon name="clock" className="rp-stat__icon" />
                                    <div>
                                        <span className="rp-stat__label">Duration</span>
                                        <span className="rp-stat__value">{reqData?.duration || "-"} Days</span>
                                    </div>
                                </div>
                                <div className="rp-stat">
                                    <Icon name="rupee" className="rp-stat__icon" />
                                    <div>
                                        <span className="rp-stat__label">Registration Fee</span>
                                        <span className="rp-stat__value">
                                            {reqData.registrationFee > 0 ? `₹ ${reqData.registrationFee}` : "Free"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rp-grid">

                                {/* ---- course & participant info ---- */}
                                <Section icon="building" title="Course Details">
                                    <div className="rp-rows">
                                        <div className="rp-row">
                                            <span className="rp-row__label">Organized By</span>
                                            <span className="rp-row__value">{reqData?.organizer || "-"}</span>
                                        </div>
                                        <div className="rp-row">
                                            <span className="rp-row__label">Reference</span>
                                            <span className="rp-row__value">{reqData?.reference || "-"}</span>
                                        </div>
                                        <div className="rp-row">
                                            <span className="rp-row__label">Venue</span>
                                            <span className="rp-row__value rp-row__value--icon">
                                                <Icon name="pin" className="rp-kv__inline-icon" />
                                                {reqData?.venue || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </Section>

                                <Section icon="user" title="Participant">
                                    <div className="rp-rows">
                                        <div className="rp-row">
                                            <span className="rp-row__label">Name & Designation</span>
                                            <span className="rp-row__value">
                                                {reqData.initiatingOfficerName
                                                    ? `${reqData?.initiatingOfficerName}, ${reqData?.empDesigName}`
                                                    : "-"}
                                            </span>
                                        </div>
                                        <div className="rp-row">
                                            <span className="rp-row__label">Prev. feedback / certificate submitted</span>
                                            <StatusPill positive={reqData.isSubmitted === "Y"} />
                                        </div>
                                    </div>
                                </Section>

                                {/* ---- necessity ---- */}
                                <Section icon="note" title="Necessity of Course & Benefits" className="rp-span-2">
                                    <p className="rp-prose">{reqData?.necessity || "-"}</p>
                                </Section>

                                {/* ---- payment & documents ---- */}
                                <Section icon="rupee" title={`Payment & Documents · ${reqData.modeOfPayment || "-"}`} className="rp-span-2">
                                    {reqData.modeOfPayment === "ECS" && (
                                        <div className="rp-files">
                                            <FileChip label="ECS File" fileName={reqData.fileEcs}
                                                onClick={() => handleDownload(reqData.requisitionId, reqData.fileEcs)} />
                                            <FileChip label="Cancelled Cheque" fileName={reqData.fileCheque}
                                                onClick={() => handleDownload(reqData.requisitionId, reqData.fileCheque)} />
                                            <FileChip label="PAN Card" fileName={reqData.filePan}
                                                onClick={() => handleDownload(reqData.requisitionId, reqData.filePan)} />
                                            <FileChip label="Brochure" fileName={reqData.fileBrochure}
                                                onClick={() => handleDownload(reqData.requisitionId, reqData.fileBrochure)} />
                                        </div>
                                    )}

                                    {["Self Payment", "NA"].includes(reqData.modeOfPayment) && (
                                        <div className="rp-mixed">
                                            <div className="rp-reason">
                                                <span className="rp-kv__label">Reason</span>
                                                <p className="rp-prose">{reqData?.reason || "-"}</p>
                                            </div>
                                            <FileChip label="Brochure" fileName={reqData.fileBrochure}
                                                onClick={() => handleDownload(reqData.requisitionId, reqData.fileBrochure)} />
                                        </div>
                                    )}

                                    {!reqData.modeOfPayment && <p className="rp-empty">No payment details provided.</p>}
                                </Section>

                                {/* ---- conference / paper ---- */}
                                {reqData.courseType === "Conference" && (
                                    <Section icon="award" title="Conference & Paper" className="rp-span-2">
                                        <div className="rp-kv-row">
                                            <div className="rp-kv">
                                                <span className="rp-kv__label">Course Type</span>
                                                <span className="rp-kv__value">{reqData.courseType}</span>
                                            </div>
                                            <div className="rp-kv">
                                                <span className="rp-kv__label">Paper presented</span>
                                                <StatusPill positive={reqData.isPaperPresent === "Y"} />
                                            </div>
                                            {reqData.titleOfPaper && (
                                                <div className="rp-kv rp-kv--wide">
                                                    <span className="rp-kv__label">Title of Paper</span>
                                                    <span className="rp-kv__value">{reqData.titleOfPaper}</span>
                                                </div>
                                            )}
                                        </div>

                                        {reqData.isPaperPresent === "Y" && (
                                            <div className="rp-files rp-files--top">
                                                <FileChip label="Committee Approval Letter" fileName={reqData.fileCommitteeApproval}
                                                    onClick={() => handleDownload(reqData.requisitionId, reqData.fileCommitteeApproval)} />
                                                <FileChip label="Paper Acceptance Letter" fileName={reqData.fileAcceptanceLetter}
                                                    onClick={() => handleDownload(reqData.requisitionId, reqData.fileAcceptanceLetter)} />
                                                <FileChip label="Paper" fileName={reqData.filePaper}
                                                    onClick={() => handleDownload(reqData.requisitionId, reqData.filePaper)} />
                                            </div>
                                        )}
                                    </Section>
                                )}

                                {/* ---- confirmation & attendance ---- */}
                                {(reqData.isConfirmed || reqData.isAttend) && (
                                    <Section icon="check" title="Confirmation & Attendance" className="rp-span-2">
                                        <div className="rp-status-row">
                                            {reqData.isConfirmed && (
                                                <div className="rp-status-item">
                                                    <span className="rp-kv__label">Confirmation received from organizer</span>
                                                    <StatusPill positive={reqData.isConfirmed === "Y"} />
                                                    {reqData.isConfirmed === "N" && (
                                                        <p className="rp-remark">{reqData?.confirmationRemarks || "-"}</p>
                                                    )}
                                                </div>
                                            )}
                                            {reqData.isAttend && (
                                                <div className="rp-status-item">
                                                    <span className="rp-kv__label">Attended the course</span>
                                                    <StatusPill positive={reqData.isAttend === "Y"} />
                                                    {reqData.isAttend === "N" && (
                                                        <p className="rp-remark">{reqData?.attendRemarks || "-"}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Section>
                                )}

                            </div>

                            <div className="rp-footer">
                                <button
                                    type="button"
                                    className="rp-btn-close"
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
    );
};

export default RequisitionPreview;