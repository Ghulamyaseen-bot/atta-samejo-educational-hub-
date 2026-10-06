import React from 'react';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { DashboardActionCards } from '../components/DashboardActionCards';
import { RecentTestsTable } from '../components/RecentTestsTable';
import { RightSidebarWidgets } from '../components/RightSidebarWidgets';
import { TestResult, Student } from '../types';
import { NavTab } from '../components/NavigationSidebar';

interface StudentDashboardViewProps {
  student: Student;
  stats: {
    testsTaken: number;
    testsTakenDelta: string;
    avgScore: number;
    avgScoreDelta: string;
    studyHours: number;
    studyHoursDelta: string;
    classRank: string;
    rankDelta: string;
    recentResults: TestResult[];
  };
  onNavigate: (tab: NavTab) => void;
  onSelectResult: (result: TestResult) => void;
  onStartTest: (testId?: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  stats,
  onNavigate,
  onSelectResult,
  onStartTest,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Responsive Layout: Single fluid column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Main Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Welcome Banner featuring Ghulam Yaseen's Permanent Official Portrait */}
          <WelcomeBanner
            studentName={student.name}
            onExploreGoals={() => onNavigate('results')}
          />

          {/* 4 Action Cards & School Metrics */}
          <DashboardActionCards
            onTakeTest={() => onNavigate('my-tests')}
            onCreateTest={() => onNavigate('create-test')}
            onOpenMcqBank={() => onNavigate('mcq-bank')}
            onOpenOmrSheet={() => onNavigate('omr-sheet')}
            onOpenOmrScan={() => onNavigate('omr-sheet')}
            onOpenStudentsForm={() => onNavigate('students-form')}
            testsTaken={stats.testsTaken}
            testsTakenDelta={stats.testsTakenDelta}
            studyHours={stats.studyHours}
            studyHoursDelta={stats.studyHoursDelta}
            rank={stats.classRank}
            rankDelta={stats.rankDelta}
          />

          {/* Recent Tests Table & Mobile Card List */}
          <RecentTestsTable
            results={stats.recentResults}
            onViewAll={() => onNavigate('results')}
            onSelectResult={onSelectResult}
          />
        </div>

        {/* Right Column / Mobile Sequential Widgets (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <RightSidebarWidgets
            studentName={student.name}
            testsTaken={stats.testsTaken}
            avgScore={stats.avgScore}
            studyTime={stats.studyHours}
            rank={stats.classRank}
            onViewAllUpcoming={() => onNavigate('my-tests')}
            onSelectUpcomingTest={(testId) => onStartTest(testId)}
          />
        </div>
      </div>
    </div>
  );
};
