import Navbar from '../navbar/Navbar';
import './Transaction.css';
import { getReqTransactionList } from '../../service/training.service';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FaCheckCircle } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';
import TrainingStepper from '../training/trainingStepper';

const Transaction = () => {

    const reqData = JSON.parse(localStorage.getItem("transactionData"));
    const [transactionDetails, setTransactionDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [remarkData, setRemarkData] = useState('');

    useEffect(() => {
        if (reqData && reqData.requisitionId) {
            fetchTransactionDetails(reqData.requisitionId);
        }
    }, []);

    const fetchTransactionDetails = async (id) => {
        try {
            const response = await getReqTransactionList(id);
            setTransactionDetails(response?.data || []);
        } catch (error) {
            console.error("Error fetching transaction details:", error);
        }
    };


    function calculateWorkingDayGap(startDate, endDate) {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) return null;

        // Normalize time to midnight
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let current = new Date(start);
        current.setDate(current.getDate() + 1); // next day
        let workingDays = 0;

        while (current <= end) {
            const day = current.getDay(); // 0 = Sun, 6 = Sat
            if (day !== 0 && day !== 6) {
                workingDays++;
            }
            current.setDate(current.getDate() + 1);
        }

        return workingDays;
    };


    const AnimatedCounter = ({ value }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            const duration = 800;
            const increment = value / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }, [value]);

        return <span>{count}</span>;
    };

    const handleRemarkView = (item) => {
        setShowModal(true);
        setRemarkData(item);
    };

    const freeSteps = [
        { code: "AA", label: "Created by user" },
        { code: "AR", label: "Recommended by DH" },
        { code: "AS", label: "Verified By SA-HRT" },
        { code: "AV", label: "Approved by AD-HRT" },
        { code: "CO", label: "Approved By Director" }
    ];

    const paidBaseSteps = [
        { code: "AA", label: "Created by user" },
        { code: "AR", label: "Recommended by DH" },
        { code: "AS", label: "Verified By SA-HRT" },
        { code: "CA", label: "Checked By CAG" },
        { code: "AV", label: "Approved by AD-HRT" },
        { code: "CO", label: "Approved By Director" }
    ];

    const financeSteps = [
        { code: "AA", label: "Created by user" },
        { code: "AR", label: "Recommended by DH" },
        { code: "AS", label: "Verified By SA-HRT" },
        { code: "CA", label: "Checked By CAG" },
        { code: "AV", label: "Approved by AD-HRT" },
        { code: "DA", label: "Approved By Director" },
        { code: "FC", label: "Financial Concurrence By DFA" },
        { code: "FA", label: "Final Approved By Director" }
    ];

    const prepareStepper = (transactions = [], registrationFee) => {
        // create status map
        const statusMap = {};
        transactions.forEach((t) => {
            statusMap[t.statusCode] = t;
        });

        let steps = [];

        // FREE TRAINING
        if (registrationFee === 0) {
            steps = [...freeSteps];
        }

        // PAID TRAINING
        else {

            steps = [...paidBaseSteps];

            // check if FC exists in transaction
            const hasFinance = transactions.some(
                (t) => t.statusCode === "DA" || t.statusCode === "FC" || t.statusCode === "FA"
            );

            if (hasFinance) {
                steps = [...financeSteps];
            }
        }

        // attach color + completed
        const finalSteps = steps.map((step) => {

            const txn = statusMap[step.code];

            return {
                ...step,
                completed: !!txn,
                colorCode: txn ? txn.colorCode : null
            };
        });

        return finalSteps;
    };

    const steps = prepareStepper(
        transactionDetails,
        reqData?.registrationFee
    );


    return (
        <>
            {/* <Navbar /> */}
            <div className="container mt-4">
                <div className="row justify-content-center">

                    <div className="transaction-title">
                        <h5>
                            Transaction Details for <strong>{reqData?.requisitionNumber || "N/A"}</strong>
                        </h5>

                        {reqData?.fromDate && reqData?.toDate && (
                            <p className="transaction-date mb-1">
                                {format(new Date(reqData.fromDate), "dd MMM yyyy")} —{" "}
                                {format(new Date(reqData.toDate), "dd MMM yyyy")}
                            </p>
                        )}
                    </div>

                    <div className="col-12 mb-1">
                        <TrainingStepper
                            title={
                                reqData?.registrationFee === 0
                                    ? "Free Training : Approval Flow"
                                    : "Paid Training : Approval Flow"
                            }
                            steps={steps}
                        />
                    </div>

                    <div className="col-md-8 col-lg-11">
                        <div className="timeline-wrapper">
                            <div className="timeline-progress"></div>
                            {transactionDetails.map((step, index) => {
                                const prevItem = transactionDetails[index - 1];
                                const gap =
                                    prevItem && step.actionDate && prevItem.actionDate
                                        ? calculateWorkingDayGap(prevItem.actionDate, step.actionDate)
                                        : null;
                                const isCurrent = index === transactionDetails.length - 1;
                                return (
                                    <div
                                        key={step.transactionId}
                                        className={`timeline-item ${index % 2 === 0 ? "left" : "right"} ${step.statusCode}`}
                                        style={{ animationDelay: `${index * 0.2}s` }}
                                    >
                                        <div className={`timeline-dot ${isCurrent ? "active" : ""}`}>
                                            <FaCheckCircle />
                                        </div>

                                        <div className="timeline-card">
                                            <div className="timeline-header">
                                                <span
                                                    className="badge-status"
                                                    style={{
                                                        background: step.colorCode
                                                            ? step.colorCode
                                                            : "linear-gradient(45deg, #0039e1, #06c0d2)"
                                                    }}
                                                >
                                                    {step.statusDetail}
                                                </span>
                                                <span className="date">
                                                    {format(new Date(step.actionDate), "dd-MM-yyyy hh:mm a")}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <p className="user">{step.forwardByName}</p>

                                                {step.remarks && (
                                                    <>
                                                        <Tooltip id="Tooltip" className='text-white' />
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            data-tooltip-id="Tooltip"
                                                            data-tooltip-content="Remarks"
                                                            data-tooltip-place="top"
                                                            onClick={() => handleRemarkView(step)}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {gap !== null && (
                                                <p className="gap">
                                                    ⏳ <AnimatedCounter value={gap} /> Working Day(s)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <>
                    <div className="modal-backdrop show custom-backdrop" onClick={() => setShowModal(false)}></div>
                    <div className="modal d-block custom-modal" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content shadow-lg rounded-3">
                                <div className="modal-header custom-modal-header">
                                    <h5 className="modal-title">Remarks Preview</h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body text-start">
                                    <div className="row mb-3">
                                        <div className="col-4 fw-semibold text-muted">Remark Date</div>
                                        <div className="col-8">{format(new Date(remarkData?.actionDate), "dd-MM-yyyy hh:mm a")}</div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-4 fw-semibold text-muted">Remark By</div>
                                        <div className="col-8">{remarkData?.forwardByName}</div>
                                    </div>

                                    <div className="row">
                                        <div className="col-4 fw-semibold text-muted">Remarks</div>
                                        <div className="col-8">
                                            <div className="p-2 border rounded bg-light">
                                                {remarkData?.remarks || <span className="text-muted">No remarks</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}

        </>
    );
};

export default Transaction;