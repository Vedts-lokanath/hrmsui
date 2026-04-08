const TrainingStepper = ({ title, steps = [] }) => {

    const completedSteps = steps.filter(s => s.completed).length;

    const progressWidth =
        steps.length > 1
            ? ((completedSteps - 1) / (steps.length - 1)) * 100
            : 0;

    return (
        <div className="card approval-card p-3 h-100">

            <div className="d-flex justify-content-between mb-3">
                <h6>{title}</h6>
                <span className="badge bg-light text-dark">
                    Step {completedSteps}/{steps.length}
                </span>
            </div>

            <div className="d-flex justify-content-between position-relative approval-wrapper">

                {/* Progress Line */}
                <div
                    className="approval-progress"
                    style={{ width: `${progressWidth}%` }}
                />

                {steps.map((step, index) => {

                    const bg = step.completed ? step.colorCode : "#dee2e6";

                    return (
                        <div key={step.code} className="text-center flex-fill">

                            <div
                                className="approval-step-sm mx-auto"
                                style={{
                                    background: bg,
                                    color: step.completed ? "#fff" : "#6c757d"
                                }}
                            >
                                {index + 1}
                            </div>

                            <div className="step-label">
                                {step.label}
                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
};

export default TrainingStepper;