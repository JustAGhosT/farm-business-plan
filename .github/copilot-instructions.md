# Copilot Instructions for Farm Business Plan Repository

## Repository Overview

This repository contains comprehensive business plan documentation and serves as the foundation for a **Diversified Farm Management and Planning Tool** built with Next.js. The project covers multiple agricultural ventures in Bela Bela, South Africa, including dragon fruit wall-farming, moringa cultivation, and lucerne production, with detailed technical, financial, and operational documentation.

## Project Context

- **Location**: Bela Bela, Limpopo Province, South Africa
- **Focus**: Diversified farm management covering multiple crops (dragon fruit, moringa, lucerne)
- **Documentation Type**: Business plan, technical specifications, financial analysis, operations manual
- **Application Type**: Next.js-based farm management and planning tool
- **Primary Language**: English (South African)
- **Format**: Markdown documentation transitioning to a web application

## File Organization

### Root Level Files

- `README.md` - Main project overview and table of contents
- `executive-summary.md` - High-level business plan summary
- `technical-implementation.md` - Technical specifications and implementation details
- `financial-analysis.md` - Financial projections and ROI calculations
- `operations-manual.md` - Daily operations and maintenance procedures
- `market-strategy.md` - Marketing and sales strategy
- `risk-management.md` - Risk assessment and mitigation plans
- `implementation-timeline.md` - Project timeline and milestones
- `appendices.md` - Supporting documentation and references

### Assets Directory

- `assets/` - Contains images, diagrams, and other media files

### Future Application Structure

When building the Next.js application, follow these conventions:

- `/app` - Next.js app directory with routing
- `/components` - Reusable React components for farm management features
- `/lib` - Utility functions, data models, and business logic
- `/public` - Static assets (images, icons)
- `/styles` - Global styles and theme configuration
- `/types` - TypeScript type definitions
- `/api` or `/app/api` - API routes for backend functionality

## Documentation Standards

### Writing Style

- Use clear, professional business language
- Maintain consistency with existing terminology and tone
- Use South African English spelling conventions
- Include practical, actionable information relevant to farming operations
- Write with consideration for both documentation and future application UI/UX

### Markdown Formatting

- Use proper heading hierarchy (H1 for document titles, H2 for major sections, H3 for subsections)
- Use tables for structured data (financial projections, schedules, metrics)
- Use emoji icons consistently with existing documentation (e.g., 🌱 :seedling:, 📊 :chart_with_upwards_trend:, 💰 :moneybag:)
- Use YAML code blocks for structured data (contact information, specifications)
- Use Mermaid diagrams for process flows and timelines where applicable

### Code Standards (for Next.js Application)

- Use TypeScript for type safety
- Follow Next.js 14+ conventions (App Router)
- Use Tailwind CSS for styling
- Implement responsive design (mobile-first approach)
- Write clean, self-documenting code with minimal comments
- Use ESLint and Prettier for code formatting
- Follow React best practices (hooks, composition, performance optimization)

### Content Guidelines

- **Financial Data**: Use South African Rand (ZAR/R) for all monetary values
- **Measurements**: Use metric system (meters, kilograms, liters, Celsius)
- **Dates**: Use format "Month Year" or "DD MMM YYYY" for consistency
- **Location References**: Always specify "Bela Bela, Limpopo Province, South Africa"

### Technical Specifications

- Include specific measurements and quantities
- Provide actionable implementation details
- Reference local conditions (climate, soil, regulations)
- Include safety protocols and compliance information

## Agricultural Context

### Key Crops (Diversified Farm Management)

1. **Dragon Fruit** - Wall-farming initiative with detailed technical specifications
2. **Moringa** - Leaf harvest and production management
3. **Lucerne** - High-value forage crop cultivation
4. **Additional Crops** - System designed to accommodate various crop types

### Farm Management Features

- Multi-crop planning and tracking
- Financial projections and ROI analysis per crop
- Operations scheduling and task management
- Resource allocation and optimization
- Market analysis and pricing strategies
- Risk assessment and mitigation planning

### Climate Considerations

- Hot summers (28°C average in summer)
- Mild winters (16°C average in winter)
- Seasonal rainfall patterns
- Frost protection requirements

### Local Context

- Small-scale diversified farming operation
- Focus on sustainable practices
- Water efficiency optimization
- Organic growing methods preference
- Scalable to multiple farm sizes and crop combinations

## Application Development Guidelines

### Next.js Best Practices

- Use Server Components by default, Client Components when needed
- Implement proper data fetching patterns (server-side when possible)
- Optimize for performance (image optimization, lazy loading, code splitting)
- Use environment variables for configuration
- Implement proper error handling and loading states
- Follow accessibility guidelines (WCAG 2.1)

### Database and Data Management

- Design schema to support multiple crop types and farm operations
- Implement proper data validation and sanitization
- Use efficient queries and caching strategies
- Support offline functionality where appropriate
- Enable data export/import for backup and migration

### UI/UX Principles

- Clean, intuitive interface for farm managers
- Dashboard with key metrics and quick actions
- Mobile-responsive design for field use
- Data visualization for financial and operational insights
- Support for South African locale (currency, date formats, language)

## Making Changes

### When Adding Documentation Content

- Ensure new content aligns with existing business plan structure
- Maintain consistency in financial calculations and projections
- Cross-reference related sections appropriately
- Update the README table of contents if adding new documents
- Consider how content will translate to the application interface

### When Adding Application Code

- Follow the established file structure and naming conventions
- Write components that are reusable across different crop types
- Implement features that scale to multiple farms/crops
- Add proper TypeScript types for all data structures
- Include unit tests for business logic and integration tests for key flows
- Document complex algorithms or business rules

### When Updating Content

- Preserve existing formatting and structure
- Maintain version numbers and dates where present
- Ensure calculations remain accurate and consistent
- Update related sections that may be affected
- Update both documentation and corresponding application features if applicable

### Quality Checklist

- [ ] Uses correct South African terminology and measurements
- [ ] Financial figures are accurate and consistent across documents
- [ ] References to location, climate, and regulations are current
- [ ] Formatting matches existing document style
- [ ] Tables and lists are properly formatted
- [ ] Links between documents work correctly
- [ ] Technical specifications are detailed and actionable
- [ ] Code follows TypeScript and React best practices (if applicable)
- [ ] Features work across different crop types and scenarios
- [ ] UI is responsive and accessible
- [ ] Performance is optimized (no unnecessary re-renders, efficient queries)

## Common Tasks

### Adding Financial Data

- Always use ZAR (R) currency
- Maintain consistent decimal places (typically 2)
- Update related summaries if modifying projections
- Include timeline context (Year 1, Year 2, etc.)
- Design financial models to work with multiple crop types

### Adding Technical Specifications

- Include measurements with units
- Provide source/justification where applicable
- Reference local suppliers or standards
- Include maintenance or safety considerations
- Structure data for easy integration into the application

### Adding Operational Procedures

- Use step-by-step formatting
- Include safety warnings where appropriate
- Specify required tools or materials
- Provide timing/scheduling information
- Consider how procedures will be tracked/managed in the application

### Building Application Features

- Start with reusable components (buttons, forms, cards)
- Implement crop-agnostic data models and logic
- Add comprehensive error handling
- Create intuitive navigation and user flows
- Test across different devices and screen sizes
- Implement proper authentication and authorization if needed

## Resources and References

### Useful Information

- Jekyll configuration in `_config.yml` for GitHub Pages
- Local climate data available in appendices
- Contact directories for suppliers and services
- Regulatory compliance checklists

### External References

- South African agricultural regulations
- Local market pricing for various crops
- Bela Bela climate data
- Sustainable farming practices

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Zustand (as needed)
- **Database**: (TBD - PostgreSQL, MongoDB, or other)
- **Authentication**: (TBD - NextAuth.js or similar)
- **Deployment**: Vercel, or other platforms

## Collaboration

When suggesting changes or additions:

- Consider the diversified farm management context (not just dragon fruit)
- Prioritize practical, implementable solutions for multiple crop types
- Respect budget constraints mentioned in financial analysis
- Align with sustainability and water efficiency goals
- Consider local South African context and regulations
- Design for scalability and flexibility across different farm operations
- Focus on user-friendly interfaces for farm managers with varying technical skills
