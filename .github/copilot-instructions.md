# GitHub Copilot Instructions for Farm Business Plan Repository

## Repository Overview

This repository contains comprehensive business plan documentation and serves as the foundation for a Diversified Farm Management and Planning Tool built with Next.js. The project covers multiple agricultural ventures in Bela Bela, South Africa, including dragon fruit wall-farming, moringa cultivation, and lucerne production, with detailed technical, financial, and operational documentation.

## Project Context

- Location: Bela Bela, Limpopo Province, South Africa
- Focus: Diversified farm management covering multiple crops including dragon fruit, moringa, and lucerne
- Documentation Type: Business plan, technical specifications, financial analysis, operations manual
- Application Type: Next.js-based farm management and planning tool
- Primary Language: English (South African)
- Tech Stack: Next.js 14+, TypeScript, Tailwind CSS, React. Repository language composition: TypeScript approximately 88.9%, PLpgSQL approximately 10.4%, other approximately 0.7%.
- Format: Markdown documentation transitioning to a web application

## File Organization

Root level files
- README.md: Main project overview and table of contents
- executive-summary.md: High-level business plan summary
- technical-implementation.md: Technical specifications and implementation details
- financial-analysis.md: Financial projections and return on investment calculations
- operations-manual.md: Daily operations and maintenance procedures
- market-strategy.md: Marketing and sales strategy
- risk-management.md: Risk assessment and mitigation plans
- implementation-timeline.md: Project timeline and milestones
- appendices.md: Supporting documentation and references

Assets directory
- assets: Contains images, diagrams, and other media files

Application structure for the Next.js app
- app: Next.js app directory with routing
- components: Reusable React components for farm management features
- lib: Utility functions, data models, and business logic
- public: Static assets such as images and icons
- styles: Global styles and theme configuration
- types: TypeScript type definitions
- app or app api: API routes for backend functionality
- hooks: Custom React hooks
- contexts: React context providers for state management

## Documentation Standards

Writing style
- Use clear, professional business language
- Maintain consistency with existing terminology and tone
- Use South African English spelling conventions, for example organisation rather than organization
- Include practical and actionable information relevant to farming operations
- Write with consideration for both documentation and future application user experience
- Target audience includes farmers, agricultural professionals, investors, and stakeholders

Markdown formatting
- Use proper heading hierarchy with H1 for document titles, H2 for major sections, H3 for subsections, and H4 for detailed points
- Use tables for structured data such as financial projections, schedules, and metrics
- Use emoji icons consistently with existing documentation such as seedling for growth and planting topics, chart with upwards trend for analytics and metrics, money bag for financial information, tractor for operations and equipment, thermometer for climate and temperature, droplet for water and irrigation, dart for goals and targets, and warning for risks and warnings
- Use YAML for structured data like contact information and specifications when needed
- Use Mermaid diagrams for process flows and timelines where applicable
- Include links between related documents

Content guidelines
- Financial data: Use South African Rand ZAR or R for all monetary values. Format as R 12,345.67 or R12,345.67. Include currency conversion notes when relevant. Provide clear financial projections with assumptions documented. Use tables for multi-year projections.
- Measurements: Use the metric system exclusively. Distance measured in meters and kilometers. Weight in grams, kilograms, and tons. Volume in liters and milliliters. Area in square meters and hectares. Temperature in degrees Celsius. Include conversions in parentheses if helpful, for example 10 hectares which equals 24.7 acres.
- Dates and times: Use the format DD MMM YYYY, for example 15 Oct 2025. For month and year use Month YYYY, for example October 2025. For date ranges use 15-20 Oct 2025 or Oct-Nov 2025. Include time zones when relevant such as 14:00 SAST, South African Standard Time.
- Location references: Always specify Bela Bela, Limpopo Province, South Africa. Use full province names rather than abbreviations. Include GPS coordinates when relevant such as 25.2659° S, 28.2918° E.

Technical specifications
- Include specific measurements and quantities
- Provide actionable implementation details
- Reference local conditions such as climate, soil, and regulations
- Include safety protocols and compliance information
- Document assumptions clearly and provide sources for technical data
- Include maintenance schedules where relevant

## Agricultural Context

Key crops for diversified farm management
1. Dragon Fruit, Pitaya. Wall-farming initiative with detailed technical specifications. Focus on Hylocereus undatus variety. Trellis and support systems. Pollination management. Harvest cycles and yield projections.
2. Moringa, Moringa oleifera. Leaf harvest and production management. Nutritional value and health benefits. Processing and packaging. Market demand and pricing.
3. Lucerne, Medicago sativa. High-value forage crop cultivation. Cutting schedules and yields. Hay production and baling. Market distribution.
4. Additional crops. System designed to accommodate various crop types. Modular approach for easy expansion. Crop rotation considerations.

Farm management features to prioritize
- Multi-crop planning and tracking including crop calendars and scheduling, growth stage monitoring, and task management with reminders
- Financial projections and return on investment analysis including per-crop profitability, cost tracking and budgeting, and revenue forecasting
- Operations scheduling including daily task lists, seasonal planning, and resource allocation
- Resource management including water usage tracking, fertilizer and input management, and equipment maintenance schedules
- Market analysis including price tracking, demand forecasting, and sales channel management
- Risk assessment including weather monitoring, pest and disease tracking, and financial risk analysis

Climate considerations for Bela Bela
- Hot summers with an average of approximately 28 degrees Celsius in December through February
- Mild winters with an average of approximately 16 degrees Celsius in June through August
- Seasonal rainfall typically October through March in this summer rainfall region
- Frost risk is low but possible in winter during June and July
- Drought risk is medium so water conservation is critical
- Heatwave management is required for sensitive crops

Local context and sustainability
- Farm type is a small-scale diversified farming operation
- Sustainability focus on sustainable and regenerative practices
- Water efficiency is critical due to regional water scarcity
- Preference for organic growing methods
- System designed to scale from small to medium farms
- Community focus considers local markets and job creation
- Comply with South African agricultural regulations

## Application Development Guidelines

Next.js best practices
- Use Next.js 14 or newer with the App Router
- Use Server Components by default
- Use Client Components only when needed for interactivity, browser APIs, client-only hooks, or client-only libraries
- Implement data fetching with server components where possible, and use client data libraries such as SWR or React Query when needed
- Use Server Actions for form submissions and mutations
- Implement proper error boundaries and loading states
- Use dynamic imports and code splitting where appropriate

File naming conventions
- Components named using PascalCase with the tsx extension, for example CropCard and FinancialDashboard
- Utilities named using camelCase with the ts extension, for example formatCurrency and calculateRoi
- Types named using PascalCase with a types suffix where helpful, for example Crop.types
- Hooks named using camelCase with a use prefix, for example useFarmData
- Constants grouped in a dedicated file and named using upper snake case where applicable

Styling standards
- Use Tailwind CSS for styling
- Create custom components in components ui for reusable UI elements
- Use CSS variables for theme colors and spacing
- Follow responsive design breakpoints such as sm 640px, md 768px, lg 1024px, xl 1280px
- Use semantic class names and group related classes
- Implement dark mode support where applicable

Code quality
- Use ESLint and Prettier for consistent code formatting
- Prefer composition over inheritance, keep components small and focused, and extract custom hooks for reusable logic
- Write self-documenting code with descriptive variable and function names
- Add JSDoc comments for complex functions
- Handle errors gracefully with try catch blocks and user friendly messages

State management
- Use React Context for global state such as theme and user preferences
- Use Zustand for complex client state management when needed
- Prefer server components to avoid unnecessary client state
- Implement optimistic updates where it improves user experience

Database and API
- Use Prisma or Drizzle for database ORM
- Implement proper data validation with Zod or Yup
- Prefer PostgreSQL for relational data and note that PLpgSQL may be used in database-side logic where appropriate
- Implement API rate limiting and authentication
- Use edge runtime for faster API responses when possible

Security
- Implement authentication with NextAuth.js or an equivalent solution
- Use environment variables for secrets and never commit them
- Implement cross-site request forgery protection
- Validate and sanitize user inputs
- Use HTTPS in production
- Implement role based access control

Testing
- Write unit tests for utilities using a modern testing framework
- Write component tests with React Testing Library
- Write end to end tests with Playwright or Cypress
- Aim for greater than 80 percent code coverage on critical paths
- Test accessibility using automated tools and manual checks

Deployment
- Deploy to Vercel which is recommended for Next.js
- Set up continuous integration and continuous deployment with GitHub Actions
- Implement monitoring with Sentry or a similar tool
- Set up privacy respecting analytics
- Configure environment variables properly in all environments

## Domain Specific Guidance

Farm data models
- Define core entities such as Crop, FinancialProjection, and Task with properties relevant to farm management including variety, planting and harvest dates, area in hectares, expected yield in kilograms, status, initial investment in ZAR, operating costs, expected revenue, return on investment percentage, break even date, and task priority and status.

Utility calculations
- Provide helper functions for common calculations including return on investment, currency formatting for South African Rand, yield per hectare, and days until harvest. These should be implemented in the lib or utils folder and thoroughly tested.

User interface components
- Build reusable farm specific components such as a crop card to display crop information, a financial chart to visualize financial projections, a task list to manage tasks, a weather widget for local weather information, a crop calendar for planting and harvest schedules, a resource tracker for water, fertilizer, and labour, a risk indicator to visualize risk levels, and a yield projection to display yield forecasts.

Accessibility
- Ensure keyboard navigation for all interactive elements
- Provide screen reader support with ARIA labels where appropriate
- Use sufficient color contrast that meets WCAG AA
- Provide alternative text for images and meaningful labels for controls
- Support text scaling up to two hundred percent
- Avoid flashing content that could trigger seizures

## Git Workflow

Commit messages
- Follow conventional commits format using types such as feat for new feature, fix for bug fix, docs for documentation changes, style for code style changes, refactor for code refactoring, test for adding or updating tests, and chore for maintenance tasks
- Examples include feat crops add dragon fruit planting calculator, fix financial correct return on investment calculation for multi-year projections, and docs readme update installation instructions

Branch naming
- main for production ready code
- develop for the primary integration branch if used
- feature slash feature name for new features
- fix slash bug description for bug fixes
- docs slash documentation update for documentation changes
- refactor slash code improvement for refactoring

Pull request guidelines
- Provide a clear description of changes and reference related issues
- Include screenshots for user interface changes
- Ensure tests pass and code is linted
- Request review from relevant team members
- Keep pull requests focused and reasonably sized

## Questions to Ask When Generating Code

1. Is this code following Next.js 14 App Router conventions?
2. Should this be a Server Component or a Client Component?
3. Is TypeScript being used with proper type definitions?
4. Are we following the South African context for currency, measurements, and locations?
5. Is the code accessible and mobile friendly?
6. Are error cases handled properly?
7. Is this code performant and optimized?
8. Does this code follow the existing patterns in the repository?
9. Are agricultural domain concepts being used correctly?
10. Is the code testable and maintainable?

## Resources and References

Documentation
- Next.js documentation: https://nextjs.org/docs
- React documentation: https://react.dev
- TypeScript documentation: https://www.typescriptlang.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs

South African agricultural resources
- Department of Agriculture, Land Reform and Rural Development: https://www.dalrrd.gov.za/
- Agricultural Research Council: https://www.arc.agric.za/
- South African Weather Service: https://www.weathersa.co.za/

Local context
- Weather data for the Bela Bela region
- Local market prices and trends
- Regional agricultural regulations
- Water restrictions and management guidelines

## Support and Contact

For questions or clarifications about this repository, review existing documentation in root level markdown files, check the issues tab for known problems and discussions, and refer to the appendices for additional references.

Last Updated: 13 Oct 2025
Maintained by: JustAGhosT
