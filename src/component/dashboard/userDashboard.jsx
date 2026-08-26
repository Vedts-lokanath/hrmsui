import { useEffect, useMemo, useRef, useState } from "react";
import "./dashboard.css";
import {
    getRequisitionPending,
    getRequisitionUserDashboardCount,
    getRequisitionUserYearlyTrend,
    getUserEvaluationCount,
} from "../../service/dashboard.service";

/*
 * How many financial years the trend chart covers.
 * Keep this between 5 and 7 per the design ask.
 */
const TREND_YEARS = 8;

const TREND_SERIES = [
    { key: "requisitions", label: "Total Requisitions", className: "trend-bar-total" },
    { key: "attended", label: "Attended", className: "trend-bar-attended" },
    { key: "notAttended", label: "Not Attended", className: "trend-bar-notattended" },
];

export const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

export const generateFinancialYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
        const start = currentYear - i;
        years.push(`${start}-${start + 1}`);
    }

    return years;
};

const getFinancialYearDates = (financialYear) => {
    if (!financialYear) return {};

    const [start, end] = financialYear.split("-");

    return {
        startDate: `${start}-04-01`,
        endDate: `${end}-03-31`,
    };
};

// Extracts the starting year (number) out of a "YYYY-YYYY" financial year string.
const financialYearStart = (financialYear) => {
    const start = parseInt(String(financialYear).split("-")[0], 10);
    return Number.isNaN(start) ? null : start;
};

const mapDashboardResponse = (raw) => {
    if (!raw) return null;

    return {
        organisers: raw.organisers || 0,
        courses: raw.courses || 0,
        requisitions: raw.requisitions || 0,
        attended: raw.attended || 0,
    };
};

/*
 * Backend returns [{ financialYear, requisitions, attended, notAttended }, ...]
 * for the trailing N financial years, oldest first. Just guard against
 * nulls so the chart never crashes on a bad payload.
 */
const mapYearlyTrend = (raw) => {
    if (!Array.isArray(raw)) return [];

    return raw.map((entry) => ({
        financialYear: entry?.financialYear || "—",
        requisitions: entry?.requisitions || 0,
        attended: entry?.attended || 0,
        notAttended:
            entry?.notAttended ??
            Math.max((entry?.requisitions || 0) - (entry?.attended || 0), 0),
    }));
};

const IMPACT_TYPES = ["E", "VG", "G", "M", "N"];

const IMPACT_COLORS = {
    E: "#198754",   // Excellent
    VG: "#0d6efd",  // Very Good
    G: "#20c997",   // Good
    M: "#ffc107",   // Margin
    N: "#dc3545",   // Nil
};

const IMPACT_LABELS = {
    E: "Excellent",
    VG: "Very Good",
    G: "Good",
    M: "Margin",
    N: "Nil",
};

const UserDashboard = () => {

    const empId = localStorage.getItem("empId");

    const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
    const [dashboardData, setDashboardData] = useState(null);
    const [evaluationData, setEvaluationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pendingFeedback, setPendingFeedback] = useState([]);
    const [yearlyTrend, setYearlyTrend] = useState([]);
    const [trendLoading, setTrendLoading] = useState(false);
    const [trendError, setTrendError] = useState(null);

    const financialYears = generateFinancialYears();
    const currentFinancialYear = useMemo(() => getCurrentFinancialYear(), []);

    const trendScrollRef = useRef(null);

    const fetchDashboardData = async (year) => {
        setLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getFinancialYearDates(year);

            const [dashboardResponse, pendingResponse, evaluationResponse] =
                await Promise.all([
                    getRequisitionUserDashboardCount(
                        empId,
                        startDate,
                        endDate
                    ),
                    getRequisitionPending(
                        empId,
                        startDate,
                        endDate
                    ),
                    getUserEvaluationCount(
                        empId,
                        startDate,
                        endDate
                    ),
                ]);

            setDashboardData(
                mapDashboardResponse(dashboardResponse)
            );

            setPendingFeedback(pendingResponse || []);
            setEvaluationData(evaluationResponse || {});

        } catch (err) {
            console.error("Dashboard Error:", err);

            setError(
                "Couldn't load the dashboard right now. Please try again."
            );

            setDashboardData(null);
            setEvaluationData(null);

        } finally {
            setLoading(false);
        }
    };

    const fetchYearlyTrend = async () => {

        setTrendLoading(true);
        setTrendError(null);

        try {
            const response = await getRequisitionUserYearlyTrend(
                empId,
                TREND_YEARS
            );
            setYearlyTrend(mapYearlyTrend(response));
        } catch (err) {
            console.error("Yearly Trend Error:", err);
            setTrendError(
                "Couldn't load the yearly trend right now."
            );
            setYearlyTrend([]);
        } finally {
            setTrendLoading(false);
        }
    };

    useEffect(() => {
        if (!financialYear) return;
        fetchDashboardData(financialYear);
    }, [financialYear]);


    useEffect(() => {
        fetchYearlyTrend();
    }, []);

    const visibleYearlyTrend = useMemo(() => {
        const currentStart = financialYearStart(currentFinancialYear);

        return yearlyTrend.filter((row) => {
            const rowStart = financialYearStart(row.financialYear);
            if (rowStart === null || currentStart === null) return true;
            return rowStart <= currentStart;
        });
    }, [yearlyTrend, currentFinancialYear]);


    const maxTrendValue = useMemo(() => {

        if (!visibleYearlyTrend.length) return 1;

        const values = visibleYearlyTrend.flatMap((row) => [
            row.requisitions,
            row.attended,
            row.notAttended,
        ]);

        return Math.max(...values, 1);

    }, [visibleYearlyTrend]);

    const hasTrendData =
        visibleYearlyTrend.length > 0 &&
        visibleYearlyTrend.some((row) => row.requisitions > 0);

    // Once the chart has data, scroll it all the way to the right so the
    // current financial year is the first thing in view.
    useEffect(() => {
        if (hasTrendData && trendScrollRef.current) {
            trendScrollRef.current.scrollLeft =
                trendScrollRef.current.scrollWidth;
        }
    }, [hasTrendData, visibleYearlyTrend.length]);

    const impactTotal = useMemo(() => {
        if (!evaluationData) return 0;
        return Object.values(evaluationData).reduce(
            (sum, value) => sum + value,
            0
        );
    }, [evaluationData]);

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <div className="dashboard-heading">
                    <div className="dashboard-title-row">
                        <h2 className="dashboard-title">
                            Requisition Dashboard
                        </h2>
                    </div>
                </div>


                <div className="fy-selector">
                    <label htmlFor="financialYear">
                        Financial Year
                    </label>

                    <select
                        id="financialYear"
                        className="form-select dashboard-select"
                        value={financialYear}
                        disabled={loading}
                        onChange={(event) =>
                            setFinancialYear(event.target.value)
                        }
                    >
                        {financialYears.map((year) => (

                            <option key={year} value={year}>
                                {year}
                            </option>

                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="dashboard-error">
                    <span className="dashboard-error-icon">
                        !
                    </span>
                    <span className="dashboard-error-text">
                        {error}
                    </span>
                    <button
                        type="button"
                        className="dashboard-error-retry"
                        onClick={() => fetchDashboardData(financialYear)}
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading && !dashboardData && !error && (
                <div className="dashboard-skeleton">
                    <div className="row g-4 mb-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div className="col-12 col-sm-6 col-xl-3" key={i}>
                                <div className="skeleton-block skeleton-card" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {dashboardData && (
                <div className="row g-4 mb-4">
                    <SummaryCard
                        colorClass="card-blue"
                        icon="👥"
                        label="Organisers"
                        value={dashboardData.organisers}
                    />

                    <SummaryCard
                        colorClass="card-purple"
                        icon="🎓"
                        label="Courses"
                        value={dashboardData.courses}
                    />

                    <SummaryCard
                        colorClass="card-orange"
                        icon="📋"
                        label="Requisitions"
                        value={dashboardData.requisitions}
                    />

                    <SummaryCard
                        colorClass="card-green"
                        icon="✓"
                        label="Attended"
                        value={dashboardData.attended}
                    />
                </div>
            )}


            {/* ============================================
                YEARLY TREND (left)  +  IMPACT / FEEDBACK (right)
            ============================================ */}

            <div className="row g-4">

                {/* ---------------- LEFT: Yearly trend ---------------- */}

                <div className="col-12 col-xl-8">
                    <div className="dashboard-card trend-card ud-trend-card">

                        <div className="chart-header">
                            <div>
                                <h5>
                                    Requisitions Over the Years
                                </h5>
                                <span>
                                    Up to {currentFinancialYear} — total,
                                    attended and not attended
                                </span>
                            </div>
                        </div>

                        {trendError && (
                            <div className="dashboard-error">
                                <span className="dashboard-error-icon">
                                    !
                                </span>
                                <span className="dashboard-error-text">
                                    {trendError}
                                </span>
                                <button
                                    type="button"
                                    className="dashboard-error-retry"
                                    onClick={fetchYearlyTrend}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {trendLoading && !visibleYearlyTrend.length && !trendError && (
                            <div className="skeleton-block skeleton-panel" />
                        )}

                        {!trendLoading && !trendError && (

                            hasTrendData ? (

                                <YearlyTrendChart
                                    data={visibleYearlyTrend}
                                    maxValue={maxTrendValue}
                                    currentYear={currentFinancialYear}
                                    scrollRef={trendScrollRef}
                                />

                            ) : (

                                <div className="course-empty-state">
                                    <span className="course-empty-icon">
                                        📭
                                    </span>
                                    <p className="course-empty-title">
                                        No historical data yet
                                    </p>
                                    <p className="course-empty-subtitle">
                                        Nothing has been recorded up to
                                        {" "}{currentFinancialYear}.
                                    </p>
                                </div>

                            )

                        )}

                    </div>
                </div>

                {/* ---------------- RIGHT: Impact + Feedback (same card) ---------------- */}

                <div className="col-12 col-xl-4">

                    <div className="dashboard-card ud-impact-feedback-card">

                        {/* Impact Chart */}
                        <div className="ud-if-section">

                            <div className="chart-header">

                                <div>
                                    <h5>
                                        Impact of Requisitions
                                    </h5>

                                    <span>
                                        Impact wise requisition count
                                    </span>
                                </div>

                                <div className="chart-total blue-text">
                                    {impactTotal}
                                </div>

                            </div>

                            <div className="pie-content ud-compact-pie-content">

                                <PieChart
                                    data={evaluationData}
                                    total={impactTotal}
                                    keys={IMPACT_TYPES}
                                    colors={IMPACT_COLORS}
                                />

                                <PieLegend
                                    data={evaluationData}
                                    total={impactTotal}
                                    keys={IMPACT_TYPES}
                                    colors={IMPACT_COLORS}
                                    labels={IMPACT_LABELS}
                                />

                            </div>

                        </div>

                        <div className="ud-if-divider" />

                        {/* Feedback Pending */}
                        <div className="ud-if-section ud-if-section-feedback">

                            <div className="chart-header">

                                <div>
                                    <h5>
                                        Feedback Pending
                                    </h5>

                                    <span>
                                        Requisitions awaiting feedback
                                    </span>
                                </div>

                                <div className="chart-total red-text">
                                    {pendingFeedback?.length || 0}
                                </div>

                            </div>


                            <div className="feedback-list ud-compact-feedback-list">

                                {pendingFeedback?.length > 0 ? (

                                    pendingFeedback.map((item) => (

                                        <div
                                            className="feedback-item"
                                            key={item.requisitionId}
                                        >

                                            <div className="feedback-req-info">

                                                <span className="feedback-label">
                                                    Requisition No.
                                                </span>

                                                <strong className="feedback-req-no">
                                                    {item.requisitionNumber}
                                                </strong>

                                            </div>

                                        </div>

                                    ))

                                ) : (

                                    <div className="feedback-empty">

                                        <span className="feedback-empty-icon">
                                            ✓
                                        </span>

                                        <span>
                                            No feedback pending
                                        </span>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
}

export default UserDashboard;

const PieChart = ({ data, total, keys = IMPACT_TYPES, colors = IMPACT_COLORS }) => {
    if (!total) {

        return (

            <div className="pie-wrapper">
                <div className="pie-chart pie-empty">
                    <div className="pie-center">
                        <strong>0</strong>
                        <small>
                            Total
                        </small>
                    </div>
                </div>
            </div>
        );
    }


    let current = 0;

    const segments = keys.map((key) => {
        const value = data[key] || 0;
        const percentage = (value / total) * 100;
        const start = current;
        current += percentage;
        return `${colors[key]} ${start}% ${current}%`;
    });

    const gradient = `conic-gradient(${segments.join(", ")})`;

    return (
        <div className="pie-wrapper">
            <div
                className="pie-chart"
                style={{
                    background: gradient,
                }}
            >
                <div className="pie-center">
                    <strong>
                        {total}
                    </strong>
                    <small>
                        Total
                    </small>
                </div>
            </div>
        </div>
    );
};


const PieLegend = ({
    data,
    total,
    keys = IMPACT_TYPES,
    colors = IMPACT_COLORS,
    labels = {},
}) => {

    return (
        <div className="pie-legend">

            {keys.map((key) => {

                const value = data?.[key] || 0;

                const percentage = total > 0
                    ? ((value / total) * 100).toFixed(1)
                    : "0.0";

                return (
                    <div
                        className="legend-item"
                        key={key}
                    >

                        <div className="legend-left">

                            <span
                                className="legend-dot"
                                style={{
                                    backgroundColor: colors[key],
                                }}
                            />

                            <span>
                                {labels[key] || key}
                            </span>

                        </div>

                        <div className="legend-value">

                            <strong>
                                {value}
                            </strong>

                            <small>
                                {percentage}%
                            </small>

                        </div>

                    </div>
                );
            })}

        </div>
    );
};

const SummaryCard = ({ colorClass, icon, label, value }) => (

    <div className="col-12 col-sm-6 col-xl-3">
        <div className={`summary-card ${colorClass}`}>
            <div className="summary-icon">
                <span>{icon}</span>
            </div>

            <div className="summary-content">

                <div className="summary-label">
                    {label}
                </div>

                <div className="summary-value">
                    {value}
                </div>

            </div>

        </div>

    </div>

);


/* =============================================================
   YEARLY TREND — horizontally scrollable, vertical grouped bar chart
============================================================= */

const YearlyTrendChart = ({ data, maxValue, currentYear, scrollRef }) => (

    <>

        {/* Legend */}

        <div className="course-legend trend-legend">

            {TREND_SERIES.map((series) => (

                <div className="course-legend-item" key={series.key}>

                    <span
                        className={`course-legend-dot trend-legend-dot ${series.className}`}
                    />

                    <span>
                        {series.label}
                    </span>

                </div>

            ))}

            {data.length > 5 && (
                <span className="ud-trend-scroll-hint">
                    ⟷ scroll for earlier years
                </span>
            )}

        </div>


        {/* Chart */}

        <div className="trend-chart-wrapper ud-trend-scroll" ref={scrollRef}>

            <div className="trend-chart">

                {data.map((row) => (

                    <div
                        className={
                            "trend-year-group" +
                            (row.financialYear === currentYear
                                ? " is-current"
                                : "")
                        }
                        key={row.financialYear}
                    >

                        <div className="trend-bars">

                            {TREND_SERIES.map((series) => {

                                const value = row[series.key] || 0;

                                const heightPercentage =
                                    (value / maxValue) * 100;

                                return (

                                    <div
                                        className="trend-bar-track"
                                        key={series.key}
                                    >

                                        <span className="trend-bar-value">
                                            {value > 0 ? value : ""}
                                        </span>

                                        <div
                                            className={`trend-bar ${series.className}`}
                                            style={{
                                                height:
                                                    value > 0
                                                        ? `${Math.max(heightPercentage, 3)}%`
                                                        : "0%",
                                            }}
                                            title={`${series.label}: ${value}`}
                                        />

                                    </div>

                                );

                            })}

                        </div>

                        <div className="trend-year-label">
                            {row.financialYear}
                            {row.financialYear === currentYear && (
                                <span className="ud-trend-current-badge">
                                    Current
                                </span>
                            )}
                        </div>

                    </div>

                ))}

            </div>

        </div>

    </>

);