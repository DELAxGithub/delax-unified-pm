import nodemailer from 'nodemailer';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { WeeklyReviewData } from '../types/weekly-review';

export interface EmailConfig {
  gmail: {
    user: string;
    appPassword: string;
  };
  recipient: string;
  baseUrl: string;
}

export async function sendWeeklyReviewEmail(
  reviewData: WeeklyReviewData,
  config: EmailConfig
): Promise<void> {
  // Gmail SMTP設定
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });

  // 今週と先週の日付を取得
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1, locale: ja });
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(currentWeekStart, 1);
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

  const subject = `週次レビュー - ${format(currentWeekStart, 'M月d日', { locale: ja })}〜${format(currentWeekEnd, 'M月d日', { locale: ja })}`;

  const htmlContent = generateEmailHTML(reviewData, config.baseUrl, {
    currentWeek: {
      start: currentWeekStart,
      end: currentWeekEnd
    },
    lastWeek: {
      start: lastWeekStart,
      end: lastWeekEnd
    }
  });

  const mailOptions = {
    from: {
      name: 'リベラリー進捗すごろく',
      address: config.gmail.user
    },
    to: config.recipient,
    subject,
    html: htmlContent
  };

  try {
    console.log('Sending email to:', config.recipient);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

function generateEmailHTML(
  reviewData: WeeklyReviewData, 
  baseUrl: string,
  dates: {
    currentWeek: { start: Date; end: Date };
    lastWeek: { start: Date; end: Date };
  }
): string {
  const { currentWeek, lastWeek } = dates;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>週次レビュー</title>
    <style>
        body {
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #4a5568;
            font-size: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .link-button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 10px 10px 10px 0;
            transition: background-color 0.3s;
        }
        .link-button:hover {
            background: #5a67d8;
        }
        .schedule-item {
            padding: 12px;
            border-left: 4px solid #667eea;
            margin-bottom: 12px;
            background: #f7fafc;
            border-radius: 0 8px 8px 0;
        }
        .schedule-date {
            font-weight: 600;
            color: #2d3748;
        }
        .schedule-title {
            color: #4a5568;
            margin-top: 4px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .status-item {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .status-count {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        .status-label {
            color: #4a5568;
            font-size: 14px;
            margin-top: 5px;
        }
        .screenshot-section {
            text-align: center;
            margin: 20px 0;
        }
        .screenshot {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 14px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 週次レビュー</h1>
        <p>${format(lastWeek.start, 'M月d日', { locale: ja })}〜${format(currentWeek.end, 'M月d日', { locale: ja })} の活動報告</p>
    </div>

    <div class="section">
        <h2>🔗 システムアクセス</h2>
        <a href="${baseUrl}/calendar" class="link-button">📅 カレンダー</a>
        <a href="${baseUrl}/kanban" class="link-button">📋 進捗すごろく</a>
        <a href="${baseUrl}/episodes" class="link-button">📺 エピソード一覧</a>
    </div>

    ${reviewData.weeklySchedule.broadcasts.length > 0 ? `
    <div class="section">
        <h2>📢 今週の放送予定</h2>
        ${reviewData.weeklySchedule.broadcasts.map(broadcast => `
        <div class="schedule-item">
            <div class="schedule-date">${format(new Date(broadcast.date), 'M月d日(E)', { locale: ja })}</div>
            <div class="schedule-title">${broadcast.program.program_id} - ${broadcast.program.title}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${reviewData.weeklySchedule.recordings.length > 0 ? `
    <div class="section">
        <h2>📍 今週の収録予定</h2>
        ${reviewData.weeklySchedule.recordings.map(recording => `
        <div class="schedule-item">
            <div class="schedule-date">${format(new Date(recording.date), 'M月d日(E)', { locale: ja })}</div>
            <div class="schedule-title">${recording.program.program_id} - ${recording.program.title}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${reviewData.weeklySchedule.tasks.length > 0 ? `
    <div class="section">
        <h2>📝 今週のタスク</h2>
        ${reviewData.weeklySchedule.tasks.map(task => `
        <div class="schedule-item">
            <div class="schedule-date">${format(new Date(task.date), 'M月d日(E)', { locale: ja })}</div>
            <div class="schedule-title">${task.task.task_type}${task.program ? ` (${task.program.program_id})` : ''}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>📊 番組ステータス概要</h2>
        <div class="status-grid">
            ${Object.entries(reviewData.statusSummary).map(([status, count]) => `
            <div class="status-item">
                <div class="status-count">${count}</div>
                <div class="status-label">${status}</div>
            </div>
            `).join('')}
        </div>
    </div>

    ${reviewData.recentUpdates.newPrograms.length > 0 ? `
    <div class="section">
        <h2>🆕 新規番組</h2>
        ${reviewData.recentUpdates.newPrograms.map(program => `
        <div class="schedule-item">
            <div class="schedule-title">${program.program_id} - ${program.title}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h2>🔗 システムへの直接アクセス</h2>
        <p>詳細な確認は以下のリンクからアクセスしてください：</p>
        <div style="margin: 20px 0;">
            <a href="${baseUrl}/calendar" style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px;">📅 カレンダー表示</a>
            <a href="${baseUrl}/kanban" style="display: inline-block; margin: 5px 10px 5px 0; padding: 10px 20px; background: #34a853; color: white; text-decoration: none; border-radius: 5px;">📋 進捗すごろく</a>
        </div>
    </div>

    <div class="footer">
        <p>このレビューは自動生成されています</p>
        <p>リベラリー進捗すごろく - Program Management System</p>
    </div>
</body>
</html>
  `;
}