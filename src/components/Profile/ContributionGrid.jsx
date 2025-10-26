import React from 'react';

const ContributionGrid = ({ weeks = 12 }) => {
  const generateMockContributionData = (weeks) => {
    const totalDays = weeks * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (totalDays - 1));

    const data = [];

    for (let w = 0; w < weeks; w += 1) {
      const week = [];
      for (let d = 0; d < 7; d += 1) {
        const index = w * 7 + d;
        const date = new Date(start);
        date.setDate(start.getDate() + index);

        const intensity = (Math.sin((index + 2) * 0.6) + 1) / 2;
        let level = 0;
        if (intensity > 0.82) {
          level = 4;
        } else if (intensity > 0.64) {
          level = 3;
        } else if (intensity > 0.46) {
          level = 2;
        } else if (intensity > 0.28) {
          level = 1;
        }

        week.push({
          date,
          level,
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        });
      }
      data.push(week);
    }

    return data;
  };

  const contributionWeeks = generateMockContributionData(weeks);

  return (
    <>
      <div className="contribution-grid" role="list">
        {contributionWeeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="week-column"
            role="listitem"
          >
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`contribution-cell level-${day.level}`}
                title={`${day.label} · ${day.level > 0
                    ? "Solved"
                    : "Missed"
                  }`}
                aria-label={`${day.label}: ${day.level > 0
                    ? "Solved"
                    : "Missed"
                  }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="contribution-legend mt-4">
        <span className="legend-label text-body-secondary">
          Less
        </span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`contribution-cell legend-cell level-${level}`}
          />
        ))}
        <span className="legend-label text-body-secondary">
          More
        </span>
      </div>
    </>
  );
};

export default ContributionGrid;

