# 🛒 Retail Sales Performance Analysis
**Tool:** MySQL Workbench | **Dataset:** Sample Superstore (Kaggle) | **Records:** 9,994 transactions

---

## 📌 Project Overview

This project applies SQL-based data cleaning and exploratory data analysis (EDA) to a retail sales dataset spanning 4 years, 4 regions, 3 product categories, and 793 unique customers. The goal was to uncover actionable business insights around revenue performance, profitability, customer value, and sales trends.

This project was built as part of my data analysis portfolio to demonstrate practical SQL skills in a real-world business context.

---

## 🗂️ Dataset

- **Source:** [Sample Superstore Dataset — Kaggle](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final)
- **Size:** 9,994 rows × 21 columns
- **Coverage:** 2014 – 2017 | United States | Furniture, Office Supplies, Technology

---

## 🛠️ SQL Concepts Demonstrated

| Concept | Application |
|---|---|
| `GROUP BY` + Aggregations | Revenue, profit and margin analysis by category, region and year |
| `JOIN` | Customer summary table joined to transactions for high-value buyer analysis |
| CTEs (`WITH`) | Multi-step profitability ranking by category and region |
| Window Functions (`LAG`, `RANK`) | Month-over-month sales growth and customer spend rankings per region |

---

## 🧹 Phase 1: Data Cleaning

Before analysis, the following checks and transformations were performed on a **staging table** (preserving the original data):

- ✅ Checked for duplicate rows using `GROUP BY` + `HAVING`
- ✅ Checked for NULL values across all critical columns (Sales, Profit, Quantity, Order ID, Customer ID)
- ✅ Checked for zero or negative sales values
- ✅ Validated consistency of all categorical columns (Region, Segment, Category, Sub-Category)
- ✅ Converted `Order Date` and `Ship Date` from text to proper `DATE` format using `STR_TO_DATE()`

**Result:** No duplicates, nulls, or anomalies found. Date columns successfully converted and stored as new cleaned columns.

---

## 📊 Phase 2: Exploratory Data Analysis

### 2.1 Sales & Profit by Category

| Category | Total Orders | Total Sales | Total Profit | Profit Margin |
|---|---|---|---|---|
| Technology | 1,737 | $805,253 | $140,476 | 17.44% |
| Furniture | 1,961 | $684,823 | $15,430 | 2.25% |
| Office Supplies | 5,450 | $664,474 | $115,790 | 17.43% |

> 💡 **Insight:** Furniture generates significant revenue but operates at a dangerously thin 2.25% margin — nearly breaking even on over a third of the business.

---

### 2.2 Sales & Profit by Region

| Region | Total Orders | Total Sales | Total Profit | Profit Margin |
|---|---|---|---|---|
| West | 2,925 | $673,121 | $98,897 | 14.69% |
| East | 2,580 | $636,194 | $85,210 | 13.39% |
| Central | 2,123 | $469,906 | $41,777 | 8.89% |
| South | 1,520 | $375,328 | $45,811 | 12.21% |

> 💡 **Insight:** The South region has the lowest sales volume but outperforms Central in profit margin (12.21% vs 8.89%) — efficiency matters more than volume alone.

---

### 2.3 Year over Year Growth

| Year | Total Orders | Total Sales | Total Profit |
|---|---|---|---|
| 2014 | 1,819 | $457,394 | $49,844 |
| 2015 | 1,936 | $435,258 | $58,931 |
| 2016 | 2,367 | $568,394 | $75,986 |
| 2017 | 3,026 | $693,503 | $86,934 |

> 💡 **Insight:** Order volume grew 66% over 4 years. Profit nearly doubled from 2014 to 2017, signalling strong and consistent business growth.

---

### 2.4 High Value Customer Analysis (JOINs)

A dedicated `customers` summary table was created and joined back to the transactions table to identify high-value repeat buyers.

**Top 3 findings:**
- **Sean Miller** — Highest spending customer at $23,669 across 8 orders, almost entirely driven by Technology purchases
- **Hunter Lopez** — Only 2 orders but $10,522 spent, giving him the highest average order value of $5,261 — high churn risk
- **Seth Vernon** — 24 orders (most frequent buyer) but only $853 average order value — high engagement, low ticket size

---

### 2.5 Most Profitable Products by Category & Region (CTEs)

Multi-step CTEs were used to rank products within each category and region by total profit.

**Key findings:**
- The **Canon imageCLASS 2200 Advanced Copier** ranked #1 in profitability in 3 out of 4 regions — the single most important product in the business
- All top 5 Furniture products were **chairs** — confirming that other furniture items (likely tables) are responsible for the category's low overall margin
- The **Ativa V4110MDD Micro-Cut Shredder** had the highest profit margin of any product at **49%**

---

### 2.6 Month over Month Sales Growth (Window Functions)

`LAG()` was used to calculate month-over-month sales growth across all 48 months in the dataset.

**Key findings:**
- **January** is consistently the weakest month every year — sharp drops of 56–80% following year-end peaks
- **September** is consistently the strongest growth month — spikes of 85–212% every year, likely driven by Q3 business purchasing cycles
- **November 2017** recorded the single highest monthly sales figure of **$112,870**
- Even the weakest January improved over time — from $13,398 in 2015 to $40,534 in 2017, showing the overall floor rising year on year

---

### 2.7 Customer Spend Rankings by Region (Window Functions)

`RANK()` with `PARTITION BY` was used to rank customers within each region by total spending.

**Key findings:**
- **Sean Miller** (South) is the highest spending customer in any single region at $23,669 — more than the top East customer by nearly $10,000
- **Grant Thornton** (South) ranks 3rd with only 2 orders — another high ticket, low frequency buyer pattern in the South
- The **West region** has the most balanced top 5 — no extreme outliers in either direction

---

## 💡 Key Business Insights Summary

1. **Furniture is a profitability problem** — high revenue but a 2.25% margin that needs immediate investigation into discounting and cost structure
2. **The Canon imageCLASS 2200 Copier is the most critical product** — top profit driver in 3 of 4 regions; supply chain and stock reliability for this product should be a priority
3. **Central region underperforms on margin despite decent volume** — high-margin products exist there, meaning heavy discounting on other items is likely the root cause
4. **January and September are the most predictable seasonal patterns** — reliable enough to inform inventory planning and promotional strategy
5. **High-value, low-frequency customers (Hunter Lopez, Grant Thornton) represent significant churn risk** — a targeted retention strategy for this segment is worth considering

---

## 📁 Repository Structure

```
retail-sales-performance-analysis/
│
├── RETAIL_SALES_PERFORMANCE_ANALYSIS.sql   # All cleaning and EDA queries
└── README.md                               # Project documentation
```

---

## 👤 Author

**Dave**
Aspiring Data Analyst | SQL • MySQL • Data Cleaning • EDA

---

*Dataset sourced from Kaggle for educational and portfolio purposes.*
