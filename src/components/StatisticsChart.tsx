'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Chart.js の必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface DailyStatistics {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

interface StatisticsChartProps {
  data: DailyStatistics[];
  type?: 'line' | 'bar';
  title: string;
  isPremium?: boolean;
}

export function StatisticsChart({ 
  data, 
  type = 'line', 
  title, 
  isPremium = false 
}: StatisticsChartProps) {


  // 日付ラベルの準備（短縮形で表示）
  const labels = data.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  // チャートデータの準備
  const chartData = {
    labels,
    datasets: [
      {
        label: '総タスク数',
        data: data.map(item => item.total_tasks),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4,
      },
      {
        label: '完了タスク数',
        data: data.map(item => item.completed_tasks),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4,
      },
    ],
  };

  // チャートオプション
  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          afterLabel: (context) => {
            const dataIndex = context.dataIndex;
            const completionRate = data[dataIndex].completion_rate;
            return `完了率: ${completionRate}%`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  // データが空の場合の表示
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-medium text-gray-900'>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-gray-500'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
                📊
              </div>
              <p>統計データがありません</p>
              <p className='text-sm mt-1'>タスクを作成すると統計が表示されます</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${!isPremium ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium text-gray-900'>
            {title}
          </CardTitle>
          {!isPremium && (
            <div className='text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded'>
              無料プラン: 7日間のみ
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-64 relative'>
          {type === 'line' ? (
            <Line data={chartData} options={options} />
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 統計サマリーカード
interface StatisticsSummaryProps {
  data: DailyStatistics[];
  isPremium?: boolean;
}

export function StatisticsSummary({ data, isPremium = false }: StatisticsSummaryProps) {
  const totalTasks = data.reduce((sum, day) => sum + day.total_tasks, 0);
  const completedTasks = data.reduce((sum, day) => sum + day.completed_tasks, 0);
  const averageCompletionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const activeDays = data.filter(day => day.total_tasks > 0).length;

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      <Card>
        <CardContent className='p-4'>
          <div className='text-2xl font-bold text-blue-600'>{totalTasks}</div>
          <div className='text-sm text-gray-600'>総タスク数</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className='p-4'>
          <div className='text-2xl font-bold text-green-600'>{completedTasks}</div>
          <div className='text-sm text-gray-600'>完了タスク数</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className='p-4'>
          <div className='text-2xl font-bold text-purple-600'>{averageCompletionRate}%</div>
          <div className='text-sm text-gray-600'>平均完了率</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className='p-4'>
          <div className='text-2xl font-bold text-orange-600'>{activeDays}</div>
          <div className='text-sm text-gray-600'>アクティブ日数</div>
          {!isPremium && (
            <div className='text-xs text-amber-600 mt-1'>過去7日間</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}