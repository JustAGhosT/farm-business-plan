# 3. FINANCIAL ANALYSIS

## 3.1 Investment Structure

### Initial Capital Requirements
| Category | Item | Cost (ZAR) | Subtotal |
|----------|------|------------|-----------|
| **Infrastructure** | | | **R4,850** |
| | Support Posts | R1,200 | |
| | Wire System | R850 | |
| | Irrigation Components | R2,300 | |
| | Installation Materials | R500 | |
| **Plant Material** | | | **R2,550** |
| | Dragon Fruit Cuttings (50) | R1,750 | |
| | Growing Medium | R500 | |
| | Amendments | R300 | |
| **Equipment** | | | **R3,100** |
| | Tools | R800 | |
| | Monitoring Systems | R1,500 | |
| | Safety Equipment | R800 | |
| **Contingency** | (15% of total) | R1,575 | **R1,575** |
| **Total Initial Investment** | | | **R12,075** |

## 3.2 Operating Costs

### Fixed Monthly Costs
| Expense Category | Monthly Cost (ZAR) | Annual Cost (ZAR) |
|-----------------|-------------------|------------------|
| Water | R50 | R600 |
| Maintenance | R100 | R1,200 |
| Marketing | R200 | R2,400 |
| Transport Fund | R300 | R3,600 |
| Insurance | R150 | R1,800 |
| **Total Fixed Costs** | **R800** | **R9,600** |

### Variable Costs (From Month 8)
| Item | Unit Cost | Monthly Estimate |
|------|-----------|------------------|
| Harvesting Labor | R50/hour | R400-600 |
| Packaging | R5/kg | R136-340 |
| Delivery | R10/km | R200-400 |
| **Total Variable Costs** | | **R736-1,340** |

## 3.3 Revenue Projections

### Year 1 Production Schedule
| Month | Plants Producing | Fruit/Plant | Total Kg | Revenue (ZAR) |
|-------|-----------------|-------------|-----------|---------------|
| 1-7 | 0 | 0 | 0 | 0 |
| 8-9 | 10 | 2 | 8 | R360 |
| 10-11 | 20 | 3 | 24 | R1,080 |
| 12 | 35 | 4 | 56 | R2,520 |

### Year 2-3 Projections
| Year | Plants | Avg Fruit/Plant | Total Kg | Revenue (ZAR) |
|------|--------|----------------|-----------|---------------|
| 2 | 50 | 8 | 160 | R57,600 |
| 3 | 50 | 12 | 240 | R86,400 |

## 3.4 Cash Flow Analysis

### Monthly Cash Flow Projection - Year 1
```
Month 1-7:  -R800 (Fixed costs only)
Month 8-9:  -R1,176 (Fixed + Variable - R360 Revenue)
Month 10-11: -R456 (Fixed + Variable - R1,080 Revenue)
Month 12:   +R984 (Fixed + Variable - R2,520 Revenue)
```

### Annual Cash Flow Summary
| Year | Revenue | Costs | Net Cash Flow |
|------|---------|-------|---------------|
| 1 | R7,920 | R19,275 | -R11,355 |
| 2 | R57,600 | R28,800 | +R28,800 |
| 3 | R86,400 | R32,400 | +R54,000 |

## 3.5 Break-Even Analysis

### Break-Even Calculation
- Fixed Costs (Annual): R9,600
- Variable Costs per Kg: R25
- Selling Price per Kg: R45
- Break-Even Point: 480 kg annually
- Expected Break-Even Timeline: Month 18

## 3.6 ROI Analysis

### Return on Investment Calculations
```
Initial Investment: R12,075
Cumulative Net Profit by Year:
Year 1: -R11,355
Year 2: +R17,445
Year 3: +R71,445

ROI at Year 3: 491%
```

## 3.7 Sensitivity Analysis

### Impact Variables
| Factor | Base Case | Worst Case | Best Case |
|--------|-----------|------------|-----------|
| Yield per Plant | 8 fruits | 6 fruits | 10 fruits |
| Price per Kg | R45 | R35 | R55 |
| Success Rate | 90% | 70% | 95% |

### Scenario Outcomes
| Scenario | Annual Revenue | ROI (Year 3) |
|----------|---------------|--------------|
| Best Case | R104,500 | 650% |
| Base Case | R86,400 | 491% |
| Worst Case | R58,800 | 280% |

import matplotlib.pyplot as plt
import numpy as np

# Create figure with multiple subplots
fig = plt.figure(figsize=(15, 10))

# 1. Monthly Cash Flow - Year 1
months = range(1, 13)
cash_flows = [-800] * 7 + [-1176] * 2 + [-456] * 2 + [984]

ax1 = fig.add_subplot(221)
ax1.plot(months, cash_flows, 'b-', marker='o')
ax1.axhline(y=0, color='r', linestyle='--')
ax1.set_title('Monthly Cash Flow - Year 1')
ax1.set_xlabel('Month')
ax1.set_ylabel('ZAR')
ax1.grid(True)

# 2. Cumulative Revenue vs Costs
years = [1, 2, 3]
revenue = [7920, 57600, 86400]
costs = [19275, 28800, 32400]

ax2 = fig.add_subplot(222)
width = 0.35
ax2.bar(np.array(years) - width/2, revenue, width, label='Revenue')
ax2.bar(np.array(years) + width/2, costs, width, label='Costs')
ax2.set_title('Annual Revenue vs Costs')
ax2.set_xlabel('Year')
ax2.set_ylabel('ZAR')
ax2.legend()

# 3. ROI Progression
roi = [-94, 144, 491]  # ROI percentages

ax3 = fig.add_subplot(223)
ax3.plot(years, roi, 'g-', marker='s')
ax3.set_title('ROI Progression')
ax3.set_xlabel('Year')
ax3.set_ylabel('ROI (%)')
ax3.grid(True)

# 4. Sensitivity Analysis
scenarios = ['Worst Case', 'Base Case', 'Best Case']
revenues = [58800, 86400, 104500]

ax4 = fig.add_subplot(224)
ax4.bar(scenarios, revenues)
ax4.set_title('Revenue Scenarios (Year 3)')
ax4.set_ylabel('ZAR')
plt.xticks(rotation=45)

plt.tight_layout()
plt.show()

import matplotlib.pyplot as plt
import numpy as np

# Data points
production = np.linspace(0, 1000, 100)  # kg of production
fixed_costs = 9600  # annual fixed costs
variable_cost_per_kg = 25
price_per_kg = 45

# Calculate total costs and revenue
total_costs = fixed_costs + (variable_cost_per_kg * production)
total_revenue = price_per_kg * production

# Calculate break-even point
break_even_kg = fixed_costs / (price_per_kg - variable_cost_per_kg)
break_even_revenue = price_per_kg * break_even_kg

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(production, total_costs, 'r-', label='Total Costs')
plt.plot(production, total_revenue, 'b-', label='Total Revenue')

# Add break-even point
plt.plot([break_even_kg], [break_even_revenue], 'go', markersize=10)
plt.annotate(f'Break-even: {break_even_kg:.0f}kg\nR{break_even_revenue:,.0f}',
             xy=(break_even_kg, break_even_revenue),
             xytext=(break_even_kg+50, break_even_revenue+5000),
             arrowprops=dict(facecolor='black', shrink=0.05))

# Formatting
plt.title('Break-Even Analysis', fontsize=14)
plt.xlabel('Production Volume (kg)', fontsize=12)
plt.ylabel('Amount (ZAR)', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend()

plt.show()
