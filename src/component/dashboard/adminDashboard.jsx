import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import "./dashboard.css";
import { getRequisitionDashboardCount } from "../../service/dashboard.service";

const COURSE_NAME_TOOLTIP_ID = "course-name-tooltip";

const CADRES = [
    "DRDS",
    "DRTC",
    "Admin & Allied",
    "Service Personnel",
    "Others",
];

const CADRE_COLORS = {
    "DRDS": "#4361ee",
    "DRTC": "#06b6d4",
    "Admin & Allied": "#f59e0b",
    "Service Personnel": "#ec4899",
    "Others": "#8b5cf6",
};


const COURSE_TYPES = [
    "Training",
    "Seminar",
    "Symposium",
    "Conference",
    "Workshop",
    "CEP",
    "Inhouse CEP",
    "Managerial",
    "MDP",
    "Targeted",
    "Technical",
    "Other"
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

const buildCountMap = (entries, keys) => {
    const map = {};

    keys.forEach((key) => {
        map[key] = 0;
    });

    (entries || []).forEach((entry) => {
        if (!entry || !entry.type) return;
        map[entry.type] = entry.count || 0;
    });

    return map;
};

const buildCourseTypeCounts = (
    entries = [],
    courseTypes = [],
    cadres = []
) => {

    const typeMap = {};
    courseTypes.forEach((type) => {

        const cadreCounts = {};

        cadres.forEach((cadre) => {
            cadreCounts[cadre] = 0;
        });

        typeMap[type] = {
            type,
            count: 0,
            courseName: null,
            cadreCounts,
        };

    });


    (entries || []).forEach((entry) => {

        if (!entry?.type) return;

        const type = entry.type;

        if (!typeMap[type]) {
            return;
        }

        const apiCadreCounts = entry.cadreCounts || {};
        const cadreCounts = {};

        cadres.forEach((cadre) => {
            cadreCounts[cadre] = apiCadreCounts[cadre] || 0;
        });


        typeMap[type] = {
            type,
            count: entry.count || 0,
            courseName: entry.courseName || null,
            cadreCounts,
        };

    });

    return courseTypes.map(
        (type) => typeMap[type]
    );

};

const buildCourseParticipants = (entries) => {
    return (entries || [])
        .map((entry) => {
            const row = {
                id: entry.type,
                course: entry.courseName || `Course #${entry.type}`,
                total: entry.count || 0,
            };

            CADRES.forEach((cadre) => {
                row[cadre] =
                    (entry.cadreCounts && entry.cadreCounts[cadre]) || 0;
            });

            return row;
        })
        .sort((a, b) => b.total - a.total);
};

const mapDashboardResponse = (raw) => {
    if (!raw) return null;

    return {
        organisers: raw.organisers || 0,
        courses: raw.courses || 0,
        requisitions: raw.requisitions || 0,
        attended: raw.attended || 0,
        attendedByCadre: buildCountMap(raw.attendedByCadre, CADRES),
        notAttendedByCadre: buildCountMap(raw.notAttendedByCadre, CADRES),
        courseTypeCounts: buildCourseTypeCounts(raw.courseTypeCounts, COURSE_TYPES, Object.keys(CADRE_COLORS)),
        courseParticipants: buildCourseParticipants(raw.courseParticipants),
    };
};

const AdminDashboard = () => {

    const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const financialYears = generateFinancialYears();

    const fetchDashboardData = async (year) => {

        setLoading(true);
        setError(null);

        try {
            const { startDate, endDate } = getFinancialYearDates(year);
            const response = await getRequisitionDashboardCount(
                startDate,
                endDate
            );
            setDashboardData(mapDashboardResponse(response));
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(
                "Couldn't load the dashboard right now. Please try again."
            );
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!financialYear) return;
        fetchDashboardData(financialYear);
    }, [financialYear]);


    const attendedTotal = useMemo(() => {
        if (!dashboardData) return 0;
        return Object.values(dashboardData.attendedByCadre).reduce(
            (sum, value) => sum + value,
            0
        );
    }, [dashboardData]);


    const notAttendedTotal = useMemo(() => {
        if (!dashboardData) return 0;
        return Object.values(dashboardData.notAttendedByCadre).reduce(
            (sum, value) => sum + value,
            0
        );
    }, [dashboardData]);


    const courseTypeTotal = useMemo(() => {
        if (!dashboardData?.courseTypeCounts?.length) {
            return 0;
        }

        return dashboardData.courseTypeCounts.reduce(
            (sum, item) => sum + (Number(item?.count) || 0),
            0
        );
    }, [dashboardData?.courseTypeCounts]);

    const totalCourseParticipants = useMemo(() => {
        if (!dashboardData) return 0;
        return dashboardData.courseParticipants.reduce(
            (sum, item) => sum + item.total,
            0
        );
    }, [dashboardData]);


    const maxCourseParticipants = useMemo(() => {
        if (!dashboardData || dashboardData.courseParticipants.length === 0) {
            return 1;
        }
        return Math.max(
            ...dashboardData.courseParticipants.map((item) => item.total)
        );
    }, [dashboardData]);


    const hasCourseData = !!dashboardData && dashboardData.courseParticipants.length > 0;


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
                <DashboardSkeleton />
            )}


            {dashboardData && (
                <>
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


                    {/* PIE CHARTS */}

                    <div className="row g-4 mb-4">

                        {/* Course type breakdown */}

                        {/* Course type breakdown */}
                        <div className="col-12 col-xl-8 d-flex">
                            <div className="dashboard-card course-type-chart-card d-flex flex-column w-100">

                                <div className="chart-header">
                                    <div>
                                        <h5>Course Type Attended Requisitions</h5>
                                        <span>
                                            Course type wise requisition count with cadre distribution
                                        </span>
                                    </div>

                                    <div className="chart-total blue-text">
                                        {courseTypeTotal}
                                    </div>
                                </div>

                                <CourseTypeStackedBarChart
                                    data={dashboardData.courseTypeCounts || []}
                                    courseTypes={COURSE_TYPES}
                                    cadres={Object.keys(CADRE_COLORS)}
                                    colors={CADRE_COLORS}
                                />

                            </div>
                        </div>


                        {/* Attended by cadre */}
                        <div className="col-12 col-xl-4 d-flex">
                            <div className="dashboard-card attended-requisition-card d-flex flex-column w-100">
                                <div className="chart-header">
                                    <div>
                                        <h5>Attended Requisitions</h5>
                                        <span>Cadre-wise attendance</span>
                                    </div>

                                    <div className="chart-total green-text">
                                        {attendedTotal}
                                    </div>
                                </div>

                                <div className="pie-content">
                                    <PieChart
                                        data={dashboardData.attendedByCadre}
                                        total={attendedTotal}
                                    />

                                    <PieLegend
                                        data={dashboardData.attendedByCadre}
                                        total={attendedTotal}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Not attended by cadre */}
                        {/* 
                        <div className="col-12 col-xl-4">
                            <div className="dashboard-card">
                                <div className="chart-header">
                                    <div>
                                        <h5>
                                            Not Attended Requisitions
                                        </h5>
                                        <span>
                                            Cadre-wise pending attendance
                                        </span>
                                    </div>
                                    <div className="chart-total orange-text">
                                        {notAttendedTotal}
                                    </div>
                                </div>


                                <div className="pie-content">
                                    <PieChart
                                        data={dashboardData.notAttendedByCadre}
                                        total={notAttendedTotal}
                                    />
                                    <PieLegend
                                        data={dashboardData.notAttendedByCadre}
                                        total={notAttendedTotal}
                                    />
                                </div>
                            </div>
                        </div> */}

                    </div>


                    {/* COURSE-WISE PARTICIPANTS */}

                    <div className="row g-4">
                        <div className="col-12">
                            <div className="dashboard-card course-card">
                                <div className="chart-header">
                                    <div>
                                        <h5>
                                            Course-wise Participants
                                        </h5>
                                        <span>
                                            Total participants with
                                            cadre-wise distribution
                                        </span>
                                    </div>

                                    <div className="chart-total blue-text">
                                        {totalCourseParticipants}
                                    </div>
                                </div>


                                {hasCourseData ? (
                                    <>
                                        <div className="course-legend">
                                            {CADRES.map((cadre) => (

                                                <div
                                                    className="course-legend-item"
                                                    key={cadre}
                                                >

                                                    <span
                                                        className="course-legend-dot"
                                                        style={{
                                                            backgroundColor:
                                                                CADRE_COLORS[
                                                                cadre
                                                                ],
                                                        }}
                                                    />

                                                    <span>
                                                        {cadre}
                                                    </span>

                                                </div>
                                            ))}
                                        </div>


                                        {/* Bars */}

                                        <div className="course-bar-chart-scroll">
                                            <div className="course-bar-chart">
                                                {dashboardData.courseParticipants.map(
                                                    (course) => (
                                                        <CourseBarRow
                                                            key={course.id}
                                                            course={course}
                                                            maxTotal={
                                                                maxCourseParticipants
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>

                                        </div>

                                        <Tooltip
                                            id={COURSE_NAME_TOOLTIP_ID}
                                            className="course-name-tooltip"
                                        />

                                    </>

                                ) : (

                                    <div className="course-empty-state">

                                        <span className="course-empty-icon">
                                            📭
                                        </span>

                                        <p className="course-empty-title">
                                            No course participation yet
                                        </p>

                                        <p className="course-empty-subtitle">
                                            Nothing has been recorded for{" "}
                                            {financialYear}. Try a different
                                            financial year.
                                        </p>

                                    </div>

                                )}

                            </div>
                        </div>
                    </div>
                </>
            )}


            {loading && dashboardData && (
                <div className="dashboard-loading">
                    <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                    />
                    <span>
                        Loading {financialYear} data...
                    </span>
                </div>
            )}

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


const CourseBarRow = ({ course, maxTotal }) => {

    const percentage = maxTotal > 0
        ? (course.total / maxTotal) * 100
        : 0;

    return (

        <div className="course-bar-row">
            <div className="course-bar-label">

                <span
                    data-tooltip-id={COURSE_NAME_TOOLTIP_ID}
                    data-tooltip-content={course.course}
                >
                    {course.course}
                </span>

                <strong>
                    {course.total}
                </strong>

            </div>

            <div className="course-bar-track">

                <div
                    className="course-bar-total"
                    style={{
                        width: `${percentage}%`,
                    }}
                >

                    {CADRES.map((cadre) => {

                        const count = course[cadre] || 0;

                        const segmentPercentage = course.total > 0
                            ? (count / course.total) * 100
                            : 0;

                        if (segmentPercentage === 0) return null;

                        return (

                            <div
                                key={cadre}
                                className="course-bar-segment"
                                style={{
                                    width: `${segmentPercentage}%`,
                                    backgroundColor: CADRE_COLORS[cadre],
                                }}
                                title={`${cadre}: ${count}`}
                            >

                                {count >= 0 && (
                                    <span>
                                        {count}
                                    </span>
                                )}

                            </div>

                        );

                    })}

                </div>

            </div>

        </div>

    );

};


/*
 * Reused for cadre pies (default keys/colors) and the
 * course-type pie (pass keys={COURSE_TYPES} colors={COURSE_TYPE_COLORS}).
 */
const PieChart = ({ data, total, keys = CADRES, colors = CADRE_COLORS }) => {
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


const PieLegend = ({ data, total, keys = CADRES, colors = CADRE_COLORS }) => {

    return (

        <div className="pie-legend">
            {keys.map((key) => {
                const value = data[key] || 0;

                const percentage = total > 0
                    ? ((value / total) * 100).toFixed(1)
                    : "0.0";

                return (

                    <div className="legend-item" key={key}>
                        <div className="legend-left">
                            <span
                                className="legend-dot"
                                style={{
                                    backgroundColor: colors[key],
                                }}
                            />
                            <span>
                                {key}
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


const DashboardSkeleton = () => (

    <div className="dashboard-skeleton">
        <div className="row g-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
                <div className="col-12 col-sm-6 col-xl-3" key={i}>
                    <div className="skeleton-block skeleton-card" />
                </div>

            ))}

        </div>

        <div className="row g-4 mb-4">

            <div className="col-12 col-xl-4">
                <div className="skeleton-block skeleton-panel" />
            </div>

            <div className="col-12 col-xl-4">
                <div className="skeleton-block skeleton-panel" />
            </div>

            <div className="col-12 col-xl-4">
                <div className="skeleton-block skeleton-panel" />
            </div>

        </div>

        <div className="row g-4">

            <div className="col-12">
                <div className="skeleton-block skeleton-panel-tall" />
            </div>

        </div>

    </div>

);

const CourseTypeStackedBarChart = ({
    data = [],
    courseTypes = [],
    cadres = [],
    colors = CADRE_COLORS,
}) => {

    const courseTypeMap = data.reduce((acc, item) => {

        if (item?.type) {
            acc[item.type] = item;
        }

        return acc;

    }, {});


    const maxCount = Math.max(
        ...courseTypes.map((type) => {

            return courseTypeMap[type]?.count || 0;

        }),
        1
    );


    return (

        <div className="course-type-chart-wrapper">

            <div className="course-type-y-axis">

                <span>{maxCount}</span>
                <span>{Math.round(maxCount * 0.75)}</span>
                <span>{Math.round(maxCount * 0.5)}</span>
                <span>{Math.round(maxCount * 0.25)}</span>
                <span>0</span>

            </div>


            <div className="course-type-scroll">

                <div
                    className="course-type-chart"
                    style={{
                        "--course-type-count": courseTypes.length,
                    }}
                >

                    {courseTypes.map((type) => {

                        const courseTypeData =
                            courseTypeMap[type];

                        const total =
                            courseTypeData?.count || 0;

                        const cadreCounts =
                            courseTypeData?.cadreCounts || {};


                        return (

                            <div
                                className="course-type-bar-item"
                                key={type}
                            >

                                <div className="course-type-bar-area">

                                    <div className="course-type-grid-lines">
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </div>


                                    {total > 0 && (

                                        <div className="course-type-bar">

                                            <div
                                                className="course-type-bar-value"
                                            >
                                                {total}
                                            </div>


                                            {cadres.map((cadre) => {

                                                const value =
                                                    cadreCounts[cadre] || 0;

                                                if (value <= 0) {
                                                    return null;
                                                }

                                                const percentage =
                                                    (value / maxCount) * 100;

                                                return (

                                                    <div
                                                        key={cadre}
                                                        className="course-type-bar-segment"
                                                        style={{
                                                            height: `${percentage}%`,
                                                            backgroundColor:
                                                                colors[cadre],
                                                        }}
                                                        title={`${cadre}: ${value}`}
                                                    >
                                                        <span>
                                                            {value}
                                                        </span>
                                                    </div>

                                                );

                                            })}

                                        </div>

                                    )}

                                </div>


                                <div
                                    className="course-type-label"
                                    title={type}
                                >
                                    {type}
                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        </div>

    );

};

export default AdminDashboard;