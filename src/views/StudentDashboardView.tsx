import React from 'react';
import { motion, Variants } from 'framer-motion';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { AssessmentTrendChart } from '../components/AssessmentTrendChart';
import { DashboardActionCards } from '../components/DashboardActionCards';
import { RecentTestsTable } from '../components/RecentTestsTable';
import { RightSidebarWidgets } from '../components/RightSidebarWidgets';
import { TestResult, Student, Role } from '../types';
import { NavTab } from '../components/NavigationSidebar';
import officialAdminPortrait from '../assets/FB_IMG_1790800525155.jpg';

interface StudentDashboardViewProps {
  student: Student;
  role?: Role;
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: 'easeOut',
    },
  },
};

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  role = 'student',
  stats,
  onNavigate,
  onSelectResult,
  onStartTest,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 max-w-7xl mx-auto"
    >
      {/* Responsive Layout: Single fluid column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Main Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Welcome Banner featuring Permanent Official Portrait */}
          <motion.div variants={cardVariants}>
            <WelcomeBanner
              studentName={student.name}
              photoUrl={(role === 'admin' || role === 'teacher') ? '/assets/FB_IMG_1790800525155.jpg' : (student.profile_photo && student.profile_photo !== '/assets/student_avatar.svg' ? student.profile_photo : '/assets/FB_IMG_1790800525155.jpg')}
              role={role}
              classNameLabel={student.class}
              rollNumber={student.roll_number}
              onExploreGoals={() => onNavigate('results')}
            />
          </motion.div>

          {/* Assessment Progress Trend Chart (Recharts) */}
          <motion.div variants={cardVariants}>
            <AssessmentTrendChart
              results={stats.recentResults}
              onViewAllResults={() => onNavigate('results')}
            />
          </motion.div>

          {/* 4 Action Cards & School Metrics */}
          <motion.div variants={cardVariants}>
            <DashboardActionCards
              role={role}
              onTakeTest={() => onNavigate('my-tests')}
              onCreateTest={() => onNavigate('create-test')}
              onOpenMcqBank={() => onNavigate('mcq-bank')}
              onOpenOmrSheet={() => onNavigate('omr-sheet')}
              onOpenOmrScan={() => onNavigate('omr-sheet')}
              onOpenStudentsForm={() => onNavigate('students-form')}
              onOpenStudyMaterials={() => onNavigate('study-materials')}
              onOpenResults={() => onNavigate('results')}
              onOpenAttendance={() => onNavigate('attendance')}
              testsTaken={stats.testsTaken}
              testsTakenDelta={stats.testsTakenDelta}
              studyHours={stats.studyHours}
              studyHoursDelta={stats.studyHoursDelta}
              rank={stats.classRank}
              rankDelta={stats.rankDelta}
            />
          </motion.div>

          {/* Recent Tests Table & Mobile Card List */}
          <motion.div variants={cardVariants}>
            <RecentTestsTable
              results={stats.recentResults}
              onViewAll={() => onNavigate('results')}
              onSelectResult={onSelectResult}
            />
          </motion.div>
        </div>

        {/* Right Column / Mobile Sequential Widgets (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <motion.div variants={cardVariants}>
            <RightSidebarWidgets
              studentName={student.name}
              testsTaken={stats.testsTaken}
              avgScore={stats.avgScore}
              studyTime={stats.studyHours}
              rank={stats.classRank}
              onViewAllUpcoming={() => onNavigate('my-tests')}
              onSelectUpcomingTest={(testId) => onStartTest(testId)}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
