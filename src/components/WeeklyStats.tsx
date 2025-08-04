import React, { useState } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { RecentWordEntry } from '../models/word';

interface WeeklyStatsProps {
    recentWords: RecentWordEntry[];
}

const formatDate = (date: Date): string =>
    date.toISOString().slice(0, 10); // "YYYY-MM-DD"

const formatWeekday = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { weekday: 'long' }); // e.g., "Monday"
};

const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const showYear = date.getFullYear() !== today.getFullYear();

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        ...(showYear && { year: 'numeric' }),
    });
};


// Get newest to oldest dates
const getLastNDates = (n: number): string[] => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < n; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(formatDate(d)); // recent first
    }

    return dates;
};

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ recentWords }) => {
    const [daysToShow, setDaysToShow] = useState<number>(7);

    const datesToShow = getLastNDates(daysToShow);
    const today = formatDate(new Date());

    const wordsPerDay: Record<string, Set<string>> = {};

    for (const date of datesToShow) {
        wordsPerDay[date] = new Set(
            recentWords
                .filter(entry => entry.timestamp.slice(0, 10) === date)
                .map(entry => entry.word)
        );
    }

    const todayCount = wordsPerDay[today]?.size || 0;

    // Detect oldest available date in data
    const oldestTrackedDate = recentWords.length
        ? recentWords.map(r => r.timestamp.slice(0, 10)).sort()[0]
        : null;

    const canLoadMore =
        oldestTrackedDate &&
        datesToShow[datesToShow.length - 1] > oldestTrackedDate;

    const handleLoadMore = () => {
        setDaysToShow(prev => prev + 7);
    };

    return (
        <Accordion className="mt-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    📅 Weekly Progress — <strong className="ms-1">Today: {todayCount}</strong>
                </Accordion.Header>
                <Accordion.Body>
                    <ul className="list-unstyled mb-3 justify-text">
                        {datesToShow.map(date => {
                            const wordCount = wordsPerDay[date].size;
                            return (
                                <li
                                    key={date}
                                    className={`d-flex justify-content-between ${wordCount === 0 ? 'text-muted' : ''}`}
                                    style={{ fontFamily: 'monospace' }} // Optional for consistent width
                                >
                                    <span>
                                        <strong>{formatWeekday(date)}</strong> ({formatDisplayDate(date)})
                                    </span>
                                    <span>
                                        {wordCount} word{wordCount !== 1 ? 's' : ''}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {canLoadMore && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleLoadMore}
                        >
                            Load More
                        </Button>
                    )}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default WeeklyStats;
