# Napoleon AI - MCP Integration Guide for Genspark AI

## Overview

This guide provides comprehensive instructions for using the Model Context Protocol (MCP) servers installed in Napoleon AI with Genspark AI for enhanced development capabilities.

## Installed MCP Servers

### Core Development Servers
- **github-repo-mcp**: Browse GitHub repositories and explore codebases
- **mcp-server-commands**: Execute shell commands and scripts
- **mcp-git**: Git operations and repository management
- **serena**: Advanced coding agent with symbolic operations

### Database & Storage
- **@supabase/mcp-utils**: Supabase database utilities and operations
- **@elastic/mcp-server-elasticsearch**: Elasticsearch integration and search
- **@vercel/mcp-adapter**: Vercel deployment and hosting integration

### AI & Language Models
- **@langchain/mcp-adapters**: LangChain integration for AI workflows
- **@mastra/mcp**: Mastra AI platform integration
- **mcp-framework**: Framework for building custom MCP servers

### Browser & Web Automation
- **@playwright/mcp**: Browser automation and web testing
- **@browsermcp/mcp**: Browser control and automation
- **mcp-proxy**: MCP server proxy with Web UI

### Content & Documentation
- **@notionhq/notion-mcp-server**: Notion workspace integration
- **@composio/mcp**: Composio platform integration
- **@rekog/mcp-nest**: NestJS MCP server framework

### Search & Research
- **tavily-mcp**: Advanced web search capabilities
- **@upstash/context7-mcp**: Context7 integration for AI context

### Testing & Development
- **mcp-hello-world**: Simple MCP server for testing
- **@playwright/mcp**: End-to-end testing automation

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# GitHub (for github-repo-mcp)
GITHUB_TOKEN=your_github_token_here

# Supabase (for @supabase/mcp-utils)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Notion (for @notionhq/notion-mcp-server)
NOTION_API_KEY=your_notion_api_key

# Elasticsearch (for @elastic/mcp-server-elasticsearch)
ELASTICSEARCH_URL=your_elasticsearch_url
ELASTICSEARCH_USERNAME=your_elasticsearch_username
ELASTICSEARCH_PASSWORD=your_elasticsearch_password

# Vercel (for @vercel/mcp-adapter)
VERCEL_TOKEN=your_vercel_token

# Playwright (for @playwright/mcp)
PLAYWRIGHT_BROWSERS_PATH=0

# Tavily (for tavily-mcp)
TAVILY_API_KEY=your_tavily_api_key

# Context7 (for @upstash/context7-mcp)
CONTEXT7_API_KEY=your_context7_api_key
```

### 2. MCP Configuration

The `.mcp.json` file is already configured with all available servers. Each server can be enabled/disabled by setting `"enabled": true/false`.

### 3. Genspark AI Integration

#### A. Using MCP Servers in Genspark AI

1. **Start Genspark AI** with MCP support enabled
2. **Load the Napoleon AI project** using the GitHub MCP server
3. **Access database operations** through Supabase MCP utilities
4. **Perform web automation** using Playwright MCP
5. **Search and research** using Tavily MCP

#### B. Common Workflows

**Code Analysis Workflow:**
```bash
# 1. Browse repository structure
github-repo-mcp list-files

# 2. Analyze specific files
github-repo-mcp read-file src/components/dashboard/page.tsx

# 3. Search for patterns
github-repo-mcp search-code "useAuth"
```

**Database Operations Workflow:**
```bash
# 1. Connect to Supabase
supabase-mcp connect

# 2. Query data
supabase-mcp query "SELECT * FROM users LIMIT 10"

# 3. Analyze schema
supabase-mcp describe-table users
```

**Web Automation Workflow:**
```bash
# 1. Launch browser
playwright-mcp launch

# 2. Navigate to application
playwright-mcp navigate "http://localhost:3000"

# 3. Perform actions
playwright-mcp click "button[data-testid='login']"
```

## Usage Examples

### 1. Repository Analysis

```bash
# Browse Napoleon AI repository structure
github-repo-mcp list-directories

# Read specific implementation files
github-repo-mcp read-file src/lib/ai/email-analyzer.ts

# Search for AI integration patterns
github-repo-mcp search-code "OpenAI"
```

### 2. Database Operations

```bash
# Connect to Supabase
supabase-mcp connect --url $SUPABASE_URL --key $SUPABASE_KEY

# Query user data
supabase-mcp query "SELECT id, email, created_at FROM users WHERE active = true"

# Analyze table structure
supabase-mcp describe-table emails
```

### 3. Web Testing

```bash
# Launch browser for testing
playwright-mcp launch --headless false

# Navigate to Napoleon AI dashboard
playwright-mcp navigate "http://localhost:3000/dashboard"

# Test authentication flow
playwright-mcp fill "input[name='email']" "test@example.com"
playwright-mcp fill "input[name='password']" "password123"
playwright-mcp click "button[type='submit']"
```

### 4. Content Management

```bash
# Connect to Notion workspace
notion-mcp connect --token $NOTION_API_KEY

# List pages
notion-mcp list-pages

# Create new page
notion-mcp create-page --title "Napoleon AI Development Notes" --content "# Development Log"
```

### 5. Search and Research

```bash
# Search for AI productivity tools
tavily-mcp search "AI email management productivity tools"

# Research specific technologies
tavily-mcp search "Next.js 15 App Router best practices"
```

## Best Practices

### 1. Security
- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate tokens regularly** for production environments
- **Limit permissions** to minimum required access

### 2. Performance
- **Disable unused servers** in `.mcp.json` to reduce startup time
- **Use headless mode** for browser automation in CI/CD
- **Implement caching** for frequently accessed data
- **Monitor resource usage** during heavy operations

### 3. Development Workflow
- **Start with simple servers** like `mcp-hello-world` for testing
- **Gradually enable complex servers** as needed
- **Document custom configurations** for team members
- **Test integrations** before production deployment

### 4. Error Handling
- **Implement retry logic** for network operations
- **Log errors appropriately** without exposing sensitive data
- **Provide fallback mechanisms** for critical operations
- **Monitor server health** and restart if needed

## Troubleshooting

### Common Issues

1. **Server Connection Failed**
   ```bash
   # Check if server is running
   npx mcp-server-commands ping
   
   # Verify environment variables
   echo $GITHUB_TOKEN
   ```

2. **Permission Denied**
   ```bash
   # Check API key permissions
   github-repo-mcp test-connection
   
   # Verify token scope
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   ```

3. **Browser Automation Issues**
   ```bash
   # Install Playwright browsers
   npx playwright install
   
   # Check browser path
   echo $PLAYWRIGHT_BROWSERS_PATH
   ```

### Debug Mode

Enable debug logging for MCP servers:

```bash
# Set debug environment variable
export MCP_DEBUG=true

# Run with verbose logging
npx mcp-server-commands --debug
```

## Advanced Configuration

### Custom MCP Server Development

1. **Create custom server** using `mcp-framework`:
   ```bash
   npx mcp-framework create my-custom-server
   ```

2. **Add to .mcp.json**:
   ```json
   {
     "my-custom-server": {
       "command": "node",
       "args": ["./my-custom-server/index.js"],
       "enabled": true
     }
   }
   ```

### Server Orchestration

Use `mcp-proxy` to manage multiple servers:

```bash
# Start proxy server
npx mcp-proxy --port 3001

# Access through proxy
curl http://localhost:3001/servers
```

## Integration with Napoleon AI Features

### 1. Email Analysis Enhancement
- Use **Tavily MCP** to research email management best practices
- Use **Supabase MCP** to analyze email patterns in database
- Use **Playwright MCP** to test email automation workflows

### 2. AI Integration Testing
- Use **LangChain MCP** to test AI model integrations
- Use **Mastra MCP** for advanced AI workflows
- Use **Context7 MCP** for enhanced AI context

### 3. Dashboard Development
- Use **GitHub MCP** to browse component implementations
- Use **Notion MCP** to document dashboard features
- Use **Playwright MCP** to test dashboard interactions

### 4. Performance Monitoring
- Use **Elasticsearch MCP** to analyze performance metrics
- Use **Vercel MCP** to monitor deployment performance
- Use **Supabase MCP** to track database performance

## Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
export NODE_ENV=production
export MCP_LOG_LEVEL=info
export MCP_TIMEOUT=30000
```

### 2. Server Health Monitoring
```bash
# Health check script
#!/bin/bash
for server in github-repo-mcp supabase-mcp playwright-mcp; do
  if ! npx $server ping; then
    echo "Server $server is down"
    exit 1
  fi
done
```

### 3. Security Hardening
- **Use service accounts** instead of personal tokens
- **Implement rate limiting** for API calls
- **Enable audit logging** for all operations
- **Regular security scans** of dependencies

## Conclusion

This MCP integration provides Napoleon AI with powerful capabilities for:
- **Enhanced code analysis** and repository exploration
- **Automated testing** and quality assurance
- **Database operations** and data analysis
- **Web automation** and user experience testing
- **Content management** and documentation
- **Research and information gathering**

By leveraging these MCP servers with Genspark AI, you can significantly enhance the development workflow for Napoleon AI, enabling more efficient code analysis, testing, and feature development.

## Support

For issues with specific MCP servers:
- **GitHub**: Check server documentation and issues
- **Supabase**: Contact Supabase support
- **Playwright**: Visit Playwright documentation
- **Notion**: Check Notion API documentation

For Napoleon AI specific issues:
- **Repository**: https://github.com/HenryVantieghem/Napoleon-app
- **Documentation**: Check `/docs` directory
- **Issues**: Create GitHub issue with detailed description 