import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

const execAsync = promisify(exec);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to send SSE message
function sendSSE(res: any, data: any) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const token = searchParams.get('token');
  const questionnaireData = searchParams.get('questionnaire');

  if (!repo || !token) {
    return new Response(
      JSON.stringify({ error: 'Repository and access token are required' }),
      { status: 400 }
    );
  }

  if (!questionnaireData) {
    return new Response(
      JSON.stringify({ error: 'Questionnaire data is required' }),
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;
  let isStreamClosed = false;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
    cancel() {
      isStreamClosed = true;
    }
  });

  const sendLog = (message: string) => {
    if (!isStreamClosed && controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', message })}\n\n`));
      } catch (error) {
        console.error('Error sending log:', error);
      }
    }
  };

  const sendError = (message: string) => {
    if (!isStreamClosed && controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`));
        controller.close();
        isStreamClosed = true;
      } catch (error) {
        console.error('Error sending error message:', error);
      }
    }
  };

  const sendComplete = () => {
    if (!isStreamClosed && controller) {
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
        controller.close();
        isStreamClosed = true;
      } catch (error) {
        console.error('Error sending complete message:', error);
      }
    }
  };

  // Start the improvement process
  (async () => {
    try {
      // Create a temporary directory for the repository
      const tempDir = path.join(process.cwd(), 'temp', repo.replace('/', '_'));
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Check if repository is already cloned
      const gitDir = path.join(tempDir, '.git');
      if (!fs.existsSync(gitDir)) {
        // Clone the repository
        sendLog('Cloning repository...');
        const cloneUrl = `https://x-access-token:${token}@github.com/${repo}.git`;
        await execAsync(`git clone ${cloneUrl} ${tempDir}`);
        sendLog('Repository cloned successfully');
      } else {
        sendLog('Repository already exists, pulling latest changes...');
        await execAsync(`cd ${tempDir} && git pull origin main`);
        sendLog('Latest changes pulled successfully');
      }

      // Create a new branch with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const branchName = `improved-landing-${timestamp}`;
      sendLog(`Creating new branch: ${branchName}`);
      await execAsync(`cd ${tempDir} && git checkout -b ${branchName}`);

      // Find the landing page
      sendLog('Searching for landing page...');
      const landingPagePath = await findLandingPage(tempDir);
      sendLog(`Found landing page at: ${landingPagePath}`);

      if (!landingPagePath) {
        sendError('Could not find landing page in the repository');
        return;
      }

      // Read the landing page content
      sendLog('Reading landing page content...');
      const content = fs.readFileSync(landingPagePath, 'utf-8');

      // Use AI to analyze and improve the landing page
      sendLog('Analyzing and improving with AI...');
      const improvedContent = await improveWithAI(content, landingPagePath, sendLog, JSON.parse(decodeURIComponent(questionnaireData)));
      
      // Write the improved content back to the file
      sendLog('Writing improved content...');
      fs.writeFileSync(landingPagePath, improvedContent);

      // Commit and push changes
      sendLog('Committing changes...');
      await execAsync(`cd ${tempDir} && git add .`);
      await execAsync(`cd ${tempDir} && git commit -m "Improve landing page with AI enhancements"`);
      sendLog('Pushing changes to GitHub...');
      await execAsync(`cd ${tempDir} && git push origin ${branchName}`);

      // Cleanup
      sendLog('Cleaning up temporary files...');
      fs.rmSync(tempDir, { recursive: true, force: true });

      sendLog('Improvement completed successfully!');
      sendComplete();
    } catch (error) {
      console.error('Error improving repository:', error);
      sendError(error instanceof Error ? error.message : 'Failed to improve repository');
    }
  })();

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function findLandingPage(dir: string): Promise<string | null> {
  try {
    // Strategy 1: Look for common landing page files in root and common directories
    const commonFiles = [
      'index.html', 'index.js', 'index.jsx', 'index.tsx', 'page.tsx', 'page.js',
      'home.html', 'home.js', 'home.jsx', 'home.tsx',
      'landing.html', 'landing.js', 'landing.jsx', 'landing.tsx',
      'main.html', 'main.js', 'main.jsx', 'main.tsx'
    ];
    
    const searchDirs = ['', 'src', 'app', 'pages', 'components', 'views', 'templates'];
    
    // First, try to find files that are likely to be landing pages
    for (const searchDir of searchDirs) {
      const dirPath = path.join(dir, searchDir);
      if (fs.existsSync(dirPath)) {
        for (const file of commonFiles) {
          const filePath = path.join(dirPath, file);
          if (fs.existsSync(filePath)) {
            console.log('Found potential landing page:', filePath);
            // Verify if it's actually a landing page
            if (await isLandingPage(filePath)) {
              console.log('Confirmed landing page:', filePath);
              return filePath;
            }
          }
        }
      }
    }

    // Strategy 2: Look for files with landing page indicators in their content
    const landingPageIndicators = [
      'hero', 'landing', 'welcome', 'homepage', 'main-content',
      'header', 'navigation', 'nav', 'banner', 'intro'
    ];

    const allFiles = await getAllFiles(dir);
    for (const file of allFiles) {
      if (isFrontendFile(file) && await hasLandingPageIndicators(file, landingPageIndicators)) {
        console.log('Found file with landing page indicators:', file);
        return file;
      }
    }

    // Strategy 3: Look for the largest frontend file (often the main page)
    const frontendFiles = allFiles.filter(isFrontendFile);
    if (frontendFiles.length > 0) {
      const largestFile = frontendFiles.reduce((largest, current) => {
        const currentSize = fs.statSync(current).size;
        const largestSize = fs.statSync(largest).size;
        return currentSize > largestSize ? current : largest;
      });
      console.log('Found largest frontend file:', largestFile);
      return largestFile;
    }

    console.log('No landing page found');
    return null;
  } catch (error) {
    console.error('Error finding landing page:', error);
    return null;
  }
}

async function isLandingPage(filePath: string): Promise<boolean> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for common landing page elements
    const landingPageElements = [
      'header', 'nav', 'hero', 'banner', 'main-content',
      'welcome', 'intro', 'cta', 'call-to-action'
    ];

    // Check for HTML/JSX structure
    const hasStructure = content.includes('<header') || 
                        content.includes('<nav') || 
                        content.includes('<main') ||
                        content.includes('className="header"') ||
                        content.includes('className="nav"') ||
                        content.includes('className="main"');

    // Check for landing page specific content
    const hasLandingContent = landingPageElements.some(element => 
      content.toLowerCase().includes(element)
    );

    // Check for routing indicators (for SPA/Next.js apps)
    const hasRouting = content.includes('useRouter') || 
                      content.includes('Link') || 
                      content.includes('Route');

    return hasStructure || hasLandingContent || hasRouting;
  } catch (error) {
    console.error('Error checking if file is landing page:', error);
    return false;
  }
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (item !== 'node_modules' && item !== '.git') {
          traverse(itemPath);
        }
      } else {
        files.push(itemPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function isFrontendFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  // Only consider actual frontend files, exclude .ts files that aren't .tsx
  return ['.html', '.js', '.jsx', '.tsx'].includes(ext);
}

async function hasLandingPageIndicators(filePath: string, indicators: string[]): Promise<boolean> {
  try {
    // Skip API routes and other backend files
    if (filePath.includes('/api/') || filePath.includes('/routes/') || filePath.includes('/server/')) {
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    
    // Check for minimum number of indicators (at least 2)
    const foundIndicators = indicators.filter(indicator => content.includes(indicator));
    if (foundIndicators.length < 2) {
      return false;
    }

    // Check for frontend framework indicators
    const hasFrameworkIndicators = 
      content.includes('react') || 
      content.includes('next') || 
      content.includes('use client') ||
      content.includes('export default function') ||
      content.includes('export default class');

    // Check for UI structure indicators
    const hasStructureIndicators = 
      content.includes('<div') || 
      content.includes('className=') || 
      content.includes('style=') ||
      content.includes('return (') ||
      content.includes('return <');

    // Must have both framework and structure indicators
    return hasFrameworkIndicators && hasStructureIndicators;
  } catch (error) {
    console.error('Error checking for landing page indicators:', error);
    return false;
  }
}

async function improveWithAI(
  content: string, 
  filePath: string, 
  sendLog: (message: string) => void,
  questionnaireData: {
    goals: string;
    importantPages: string;
    targetMetrics: string;
    callToActions: string;
    userInteractions: string;
    successCriteria: string;
  }
): Promise<string> {
  try {
    // Prepare the prompt with questionnaire data
    const prompt = `
      I need to improve a frontend page based on the following requirements:

      Project Goals:
      ${questionnaireData.goals}

      Important Pages:
      ${questionnaireData.importantPages}

      Target Metrics:
      ${questionnaireData.targetMetrics}

      Call-to-Action Buttons:
      ${questionnaireData.callToActions}

      User Interactions:
      ${questionnaireData.userInteractions}

      Success Criteria:
      ${questionnaireData.successCriteria}

      Current page content:
      ${content}

      Please improve this page to:
      1. Optimize for the specified goals and metrics
      2. Enhance the call-to-action buttons
      3. Improve user interactions
      4. Add analytics tracking for the specified metrics
      5. Ensure the page meets the success criteria

      Return the improved code with detailed explanations of the changes made.
    `;

    sendLog('Sending content to AI for analysis...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert frontend developer specializing in UI/UX optimization and A/B testing. Your task is to improve frontend code based on specific goals and requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const improvedContent = completion.choices[0].message.content;
    if (!improvedContent) {
      throw new Error('No improvement suggestions received from AI');
    }

    sendLog('AI analysis complete. Applying improvements...');

    // Add analytics tracking
    let finalContent = improvedContent;
    if (filePath.endsWith('.html')) {
      finalContent = addAnalyticsScript(finalContent);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      finalContent = addAnalyticsComponent(finalContent);
    }

    return finalContent;
  } catch (error) {
    console.error('Error in AI improvement:', error);
    throw error;
  }
}

function addAnalyticsScript(html: string): string {
  const analyticsScript = `
    <script>
      // User interaction tracking
      const analytics = {
        startTime: Date.now(),
        scrollDepth: 0,
        interactions: [],
        
        init() {
          // Track scroll depth
          window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
            if (scrollPercent > this.scrollDepth) {
              this.scrollDepth = scrollPercent;
              this.logInteraction('scroll', { depth: scrollPercent });
            }
          });

          // Track button clicks
          document.querySelectorAll('button, a, [role="button"]').forEach(element => {
            element.addEventListener('click', (e) => {
              this.logInteraction('click', {
                element: element.tagName,
                text: element.textContent?.trim(),
                id: element.id,
                class: element.className
              });
            });
          });

          // Track form interactions
          document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
              this.logInteraction('form_submit', {
                formId: form.id,
                formAction: form.action
              });
            });
          });

          // Track media interactions
          document.querySelectorAll('video, audio').forEach(media => {
            media.addEventListener('play', () => {
              this.logInteraction('media_play', {
                type: media.tagName,
                id: media.id
              });
            });
          });

          // Track time spent
          setInterval(() => {
            const timeSpent = (Date.now() - this.startTime) / 1000;
            this.logInteraction('time_spent', { seconds: timeSpent });
          }, 30000); // Log every 30 seconds
        },

        logInteraction(type, data) {
          this.interactions.push({
            type,
            data,
            timestamp: new Date().toISOString()
          });
          
          // Send to analytics endpoint
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              data,
              timestamp: new Date().toISOString()
            })
          }).catch(console.error);
        }
      };

      // Initialize analytics when DOM is loaded
      document.addEventListener('DOMContentLoaded', () => analytics.init());
    </script>
  `;

  // Insert the script before the closing body tag
  return html.replace('</body>', `${analyticsScript}\n</body>`);
}

function addAnalyticsComponent(code: string): string {
  const analyticsComponent = `
    // Analytics component
    const Analytics = () => {
      useEffect(() => {
        const analytics = {
          startTime: Date.now(),
          scrollDepth: 0,
          interactions: [],
          
          init() {
            // Track scroll depth
            const handleScroll = () => {
              const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
              if (scrollPercent > this.scrollDepth) {
                this.scrollDepth = scrollPercent;
                this.logInteraction('scroll', { depth: scrollPercent });
              }
            };

            // Track button clicks
            const handleClick = (e) => {
              const element = e.target;
              if (element.matches('button, a, [role="button"]')) {
                this.logInteraction('click', {
                  element: element.tagName,
                  text: element.textContent?.trim(),
                  id: element.id,
                  class: element.className
                });
              }
            };

            // Track form interactions
            const handleSubmit = (e) => {
              if (e.target.tagName === 'FORM') {
                this.logInteraction('form_submit', {
                  formId: e.target.id,
                  formAction: e.target.action
                });
              }
            };

            // Track media interactions
            const handleMediaPlay = (e) => {
              if (e.target.matches('video, audio')) {
                this.logInteraction('media_play', {
                  type: e.target.tagName,
                  id: e.target.id
                });
              }
            };

            // Add event listeners
            window.addEventListener('scroll', handleScroll);
            document.addEventListener('click', handleClick);
            document.addEventListener('submit', handleSubmit);
            document.addEventListener('play', handleMediaPlay, true);

            // Track time spent
            const timeInterval = setInterval(() => {
              const timeSpent = (Date.now() - this.startTime) / 1000;
              this.logInteraction('time_spent', { seconds: timeSpent });
            }, 30000);

            // Cleanup function
            return () => {
              window.removeEventListener('scroll', handleScroll);
              document.removeEventListener('click', handleClick);
              document.removeEventListener('submit', handleSubmit);
              document.removeEventListener('play', handleMediaPlay, true);
              clearInterval(timeInterval);
            };
          },

          logInteraction(type, data) {
            this.interactions.push({
              type,
              data,
              timestamp: new Date().toISOString()
            });
            
            // Send to analytics endpoint
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type,
                data,
                timestamp: new Date().toISOString()
              })
            }).catch(console.error);
          }
        };

        const cleanup = analytics.init();
        return cleanup;
      }, []);

      return null;
    };
  `;

  // Add the Analytics component to the main component
  return code.replace(
    /export default function (\w+)/,
    `${analyticsComponent}\n\nexport default function $1`
  ).replace(
    /return \(/,
    'return (\n    <>\n      <Analytics />\n      '
  ).replace(
    /\);/,
    '\n    </>\n  );'
  );
} 