import React from "react";

interface EmailSummary {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  priority: "high" | "medium" | "low";
  urgency: "urgent" | "normal" | "low";
  aiSummary: string;
  suggestedAction: string;
  category: "work" | "personal" | "project" | "meeting";
}

interface DailyDigestProps {
  userName: string;
  date: string;
  totalEmails: number;
  unreadCount: number;
  urgentCount: number;
  emailSummaries: EmailSummary[];
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export const DailyDigest: React.FC<DailyDigestProps> = ({
  userName,
  date,
  totalEmails,
  unreadCount,
  urgentCount,
  emailSummaries,
  dashboardUrl,
  unsubscribeUrl,
}) => {
  const priorityColors = {
    high: "#DC2626",
    medium: "#F59E0B",
    low: "#10B981",
  };

  const urgencyIcons = {
    urgent: "⚡",
    normal: "📧",
    low: "📌",
  };

  return (
    <div className="email-container">
      <div className="header">
        <div className="logo">Napoleon</div>
        <div className="tagline">Your Daily Email Digest</div>
        <div className="date">{date}</div>
      </div>

      <div className="content">
        <h1 className="greeting">Good morning, {userName}! ☀️</h1>

        <div className="stats">
          <div className="stat">
            <div className="stat-number">{totalEmails}</div>
            <div className="stat-label">Total Emails</div>
          </div>
          <div className="stat">
            <div className="stat-number">{unreadCount}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat urgent">
            <div className="stat-number">{urgentCount}</div>
            <div className="stat-label">Urgent</div>
          </div>
        </div>

        <div className="summary">
          <h2>Today&apos;s Priority Emails</h2>
          <p>Here are the emails that need your attention today:</p>
        </div>

        <div className="email-list">
          {emailSummaries.map((email) => (
            <div key={email.id} className="email-item">
              <div className="email-header">
                <div className="email-meta">
                  <div className="sender">{email.fromName}</div>
                  <div className="subject">{email.subject}</div>
                </div>
                <div
                  className="priority-badge"
                  style={{ backgroundColor: priorityColors[email.priority] }}
                >
                  {email.priority.toUpperCase()}
                </div>
              </div>

              <div className="email-content">
                <div className="ai-summary">
                  <strong>AI Summary:</strong> {email.aiSummary}
                </div>
                <div className="suggested-action">
                  <strong>Suggested Action:</strong> {email.suggestedAction}
                </div>
              </div>

              <div className="email-footer">
                <span className="urgency">
                  {urgencyIcons[email.urgency]} {email.urgency}
                </span>
                <span className="category">{email.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-section">
          <a href={dashboardUrl} className="cta-button">
            View All Emails
          </a>
        </div>

        <div className="tips">
          <h3>💡 Pro Tips</h3>
          <ul>
            <li>Use AI-generated replies to respond faster</li>
            <li>Set up filters to automatically categorize emails</li>
            <li>Enable notifications for urgent messages</li>
          </ul>
        </div>
      </div>

      <div className="footer">
        <p className="footer-text">
          This digest was generated by your AI assistant.
          <a href={dashboardUrl}> View in Dashboard</a>
        </p>

        <div className="footer-links">
          <a href="/settings" className="footer-link">
            Settings
          </a>
          <a href="/help" className="footer-link">
            Help
          </a>
          <a href={unsubscribeUrl} className="footer-link">
            Unsubscribe
          </a>
        </div>
      </div>
    </div>
  );
};

// Email styles as a separate object for easy customization
export const dailyDigestStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #000000;
    background-color: #FFFFFF;
  }
  
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #FFFFFF;
  }
  
  .header {
    text-align: center;
    padding: 48px 24px 32px;
    border-bottom: 1px solid #F0F0F0;
  }
  
  .logo {
    font-size: 32px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 8px;
  }
  
  .tagline {
    font-size: 16px;
    color: #666666;
    font-weight: 400;
    margin-bottom: 8px;
  }
  
  .date {
    font-size: 14px;
    color: #999999;
  }
  
  .content {
    padding: 48px 24px;
  }
  
  .greeting {
    font-size: 24px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 32px;
  }
  
  .stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 48px;
    padding: 24px;
    background-color: #FAFAFA;
    border-radius: 12px;
  }
  
  .stat {
    text-align: center;
  }
  
  .stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666666;
  }
  
  .stat.urgent .stat-number {
    color: #DC2626;
  }
  
  .summary {
    margin-bottom: 32px;
  }
  
  .summary h2 {
    font-size: 20px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8px;
  }
  
  .summary p {
    font-size: 16px;
    color: #666666;
  }
  
  .email-list {
    margin-bottom: 48px;
  }
  
  .email-item {
    border: 1px solid #E5E5E5;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    background-color: #FFFFFF;
  }
  
  .email-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .email-meta {
    flex: 1;
  }
  
  .sender {
    font-size: 16px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 4px;
  }
  
  .subject {
    font-size: 14px;
    color: #666666;
  }
  
  .priority-badge {
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  
  .email-content {
    margin-bottom: 16px;
  }
  
  .ai-summary,
  .suggested-action {
    font-size: 14px;
    color: #333333;
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .email-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999999;
  }
  
  .urgency,
  .category {
    text-transform: capitalize;
  }
  
  .cta-section {
    text-align: center;
    margin-bottom: 48px;
  }
  
  .cta-button {
    display: inline-block;
    background-color: #D4AF37;
    color: #000000;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  .cta-button:hover {
    background-color: #B8941F;
    transform: translateY(-2px);
  }
  
  .tips {
    background-color: #F8F9FA;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 32px;
  }
  
  .tips h3 {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
  }
  
  .tips ul {
    list-style: none;
    padding: 0;
  }
  
  .tips li {
    font-size: 14px;
    color: #666666;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
  }
  
  .tips li:before {
    content: "•";
    color: #D4AF37;
    font-weight: bold;
    position: absolute;
    left: 0;
  }
  
  .footer {
    padding: 32px 24px;
    background-color: #FAFAFA;
    text-align: center;
    border-top: 1px solid #F0F0F0;
  }
  
  .footer-text {
    font-size: 14px;
    color: #666666;
    margin-bottom: 16px;
  }
  
  .footer-links {
    margin-bottom: 24px;
  }
  
  .footer-link {
    color: #D4AF37;
    text-decoration: none;
    margin: 0 12px;
    font-size: 14px;
  }
  
  .footer-link:hover {
    text-decoration: underline;
  }
  
  @media (max-width: 600px) {
    .content {
      padding: 32px 16px;
    }
    
    .header {
      padding: 32px 16px 24px;
    }
    
    .stats {
      flex-direction: column;
      gap: 16px;
    }
    
    .email-header {
      flex-direction: column;
      gap: 8px;
    }
    
    .email-footer {
      flex-direction: column;
      gap: 4px;
    }
  }
`;

export default DailyDigest;
