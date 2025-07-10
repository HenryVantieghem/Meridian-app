import React from 'react';

interface BillingEmailProps {
  userName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  billingDate: string;
  dueDate: string;
  planName: string;
  status: 'paid' | 'pending' | 'overdue';
  invoiceUrl: string;
  billingPortalUrl: string;
  supportEmail: string;
}

export const BillingEmail: React.FC<BillingEmailProps> = ({
  userName,
  invoiceNumber,
  amount,
  currency,
  billingDate,
  dueDate,
  planName,
  status,
  invoiceUrl,
  billingPortalUrl,
  supportEmail,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#DC2626';
      default:
        return '#666666';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'paid':
        return '✅ Paid';
      case 'pending':
        return '⏳ Pending';
      case 'overdue':
        return '⚠️ Overdue';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="email-container">
      <div className="header">
        <div className="logo">Meridian</div>
        <div className="tagline">Billing & Subscription</div>
      </div>
      
      <div className="content">
        <h1 className="greeting">Hello, {userName}!</h1>
        
        <div className="billing-card">
          <div className="billing-header">
            <h2>Invoice #{invoiceNumber}</h2>
            <div 
              className="status-badge"
              style={{ backgroundColor: getStatusColor() }}
            >
              {getStatusText()}
            </div>
          </div>
          
          <div className="billing-details">
            <div className="detail-row">
              <span className="label">Plan:</span>
              <span className="value">{planName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value amount">{currency}{amount}</span>
            </div>
            <div className="detail-row">
              <span className="label">Billing Date:</span>
              <span className="value">{billingDate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Due Date:</span>
              <span className="value">{dueDate}</span>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <a href={invoiceUrl} className="primary-button">
            View Invoice
          </a>
          <a href={billingPortalUrl} className="secondary-button">
            Manage Billing
          </a>
        </div>
        
        <div className="info-section">
          <h3>📋 What's included in your plan:</h3>
          <ul className="features-list">
            <li>✅ Unlimited email analysis</li>
            <li>✅ AI-powered reply generation</li>
            <li>✅ Priority email filtering</li>
            <li>✅ Gmail & Slack integration</li>
            <li>✅ Real-time notifications</li>
            <li>✅ Advanced analytics</li>
          </ul>
        </div>
        
        {status === 'overdue' && (
          <div className="alert-section">
            <h3>⚠️ Payment Overdue</h3>
            <p>
              Your payment is overdue. Please update your payment method to continue 
              enjoying Meridian's features without interruption.
            </p>
            <a href={billingPortalUrl} className="alert-button">
              Update Payment Method
            </a>
          </div>
        )}
        
        <div className="support-section">
          <h3>Need help?</h3>
          <p>
            If you have any questions about your billing or subscription, 
            our support team is here to help.
          </p>
          <a href={`mailto:${supportEmail}`} className="support-link">
            Contact Support
          </a>
        </div>
      </div>
      
      <div className="footer">
        <p className="footer-text">
          Thank you for choosing Meridian. We're committed to helping you 
          transform your productivity with AI-powered email management.
        </p>
        
        <div className="footer-links">
          <a href="/billing" className="footer-link">Billing</a>
          <a href="/privacy" className="footer-link">Privacy</a>
          <a href="/terms" className="footer-link">Terms</a>
        </div>
      </div>
    </div>
  );
};

// Email styles as a separate object for easy customization
export const billingEmailStyles = `
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
  
  .billing-card {
    background-color: #FAFAFA;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 32px;
    border: 1px solid #E5E5E5;
  }
  
  .billing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .billing-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: #000000;
  }
  
  .status-badge {
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
    text-transform: uppercase;
  }
  
  .billing-details {
    margin-bottom: 24px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #E5E5E5;
  }
  
  .detail-row:last-child {
    border-bottom: none;
  }
  
  .label {
    font-size: 14px;
    color: #666666;
    font-weight: 500;
  }
  
  .value {
    font-size: 14px;
    color: #000000;
    font-weight: 600;
  }
  
  .amount {
    font-size: 18px;
    color: #D4AF37;
  }
  
  .action-buttons {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    justify-content: center;
  }
  
  .primary-button,
  .secondary-button {
    display: inline-block;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
  }
  
  .primary-button {
    background-color: #D4AF37;
    color: #000000;
  }
  
  .primary-button:hover {
    background-color: #B8941F;
    transform: translateY(-2px);
  }
  
  .secondary-button {
    background-color: #F8F9FA;
    color: #333333;
    border: 1px solid #E5E5E5;
  }
  
  .secondary-button:hover {
    background-color: #E5E5E5;
    transform: translateY(-2px);
  }
  
  .info-section {
    margin-bottom: 32px;
  }
  
  .info-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
  }
  
  .features-list {
    list-style: none;
    padding: 0;
  }
  
  .features-list li {
    font-size: 14px;
    color: #333333;
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
  }
  
  .features-list li:before {
    content: "✓";
    color: #10B981;
    font-weight: bold;
    position: absolute;
    left: 0;
  }
  
  .alert-section {
    background-color: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 32px;
  }
  
  .alert-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #DC2626;
    margin-bottom: 12px;
  }
  
  .alert-section p {
    font-size: 14px;
    color: #666666;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .alert-button {
    display: inline-block;
    background-color: #DC2626;
    color: #FFFFFF;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .alert-button:hover {
    background-color: #B91C1C;
    transform: translateY(-1px);
  }
  
  .support-section {
    background-color: #F8F9FA;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 32px;
  }
  
  .support-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 12px;
  }
  
  .support-section p {
    font-size: 14px;
    color: #666666;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .support-link {
    color: #D4AF37;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
  }
  
  .support-link:hover {
    text-decoration: underline;
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
    
    .billing-card {
      padding: 24px;
    }
    
    .billing-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .action-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .primary-button,
    .secondary-button {
      width: 100%;
      max-width: 200px;
      text-align: center;
    }
  }
`;

export default BillingEmail; 