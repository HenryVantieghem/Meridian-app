import React from 'react';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  onboardingUrl: string;
  supportEmail: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  userEmail,
  onboardingUrl,
  supportEmail,
}) => {
  return (
    <div className="email-container">
      <div className="header">
        <div className="logo">Napoleon</div>
        <div className="tagline">AI-Powered Productivity Platform</div>
      </div>
      
      <div className="content">
        <h1 className="greeting">Welcome to Napoleon, {userName}! 👋</h1>
        
        <p className="intro">
          Thank you for joining Napoleon. We're excited to help you transform your communication
          workflow with AI-powered insights and intelligent automation.
        </p>
        
        <p className="features-intro">
          With Napoleon, you'll experience:
        </p>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <div className="feature-content">
              <h3>AI-Powered Analysis</h3>
              <p>Intelligent email prioritization and smart reply suggestions</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <div className="feature-content">
              <h3>Lightning Fast</h3>
              <p>Process hundreds of emails in seconds with our advanced AI</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <div className="feature-content">
              <h3>Smart Focus</h3>
              <p>Never miss important emails with intelligent filtering</p>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <a href={onboardingUrl} className="cta-button">
            Get Started Now
          </a>
        </div>
        
        <p className="message">
          Ready to get started? Complete your setup in just a few minutes and start 
          experiencing the future of email management.
        </p>
      </div>
      
      <div className="footer">
        <p className="footer-text">
          Need help? We're here for you at{' '}
          <a href={`mailto:${supportEmail}`} className="footer-link">
            {supportEmail}
          </a>
        </p>
        
        <div className="footer-links">
          <a href="/help" className="footer-link">Help Center</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
        </div>
        
        <p className="unsubscribe">
          You received this email because you signed up for Napoleon. 
          <a href="/unsubscribe"> Unsubscribe</a>
        </p>
      </div>
    </div>
  );
};

// Email styles as a separate object for easy customization
export const welcomeEmailStyles = `
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
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    margin-bottom: 24px;
    line-height: 1.3;
  }
  
  .message {
    font-size: 16px;
    color: #333333;
    margin-bottom: 32px;
    line-height: 1.7;
  }
  
  .highlight {
    color: #D4AF37;
    font-weight: 600;
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
    margin: 32px 0;
    transition: all 0.3s ease;
  }
  
  .cta-button:hover {
    background-color: #B8941F;
    transform: translateY(-2px);
  }
  
  .features {
    margin: 48px 0;
  }
  
  .feature {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 16px;
    background-color: #FAFAFA;
    border-radius: 8px;
  }
  
  .feature-icon {
    width: 24px;
    height: 24px;
    background-color: #D4AF37;
    border-radius: 50%;
    margin-right: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #000000;
    font-weight: 700;
  }
  
  .feature-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 8px;
  }
  
  .feature-content p {
    font-size: 14px;
    color: #666666;
    line-height: 1.5;
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
  
  .unsubscribe {
    font-size: 12px;
    color: #999999;
  }
  
  .unsubscribe a {
    color: #999999;
    text-decoration: none;
  }
  
  @media (max-width: 600px) {
    .content {
      padding: 32px 16px;
    }
    
    .header {
      padding: 32px 16px 24px;
    }
    
    .greeting {
      font-size: 20px;
    }
    
    .message {
      font-size: 15px;
    }
    
    .cta-button {
      padding: 14px 28px;
      font-size: 15px;
    }
  }
`;

export default WelcomeEmail; 