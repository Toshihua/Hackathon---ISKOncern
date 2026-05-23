# Production Cloud Database & Deployment Handbook
## Project: Minimalist Full-Stack Portfolio & Blog Engine

This handbook details how to configure a managed cloud database, securely set environment variables, perform remote migrations, and launch the hybrid hosting model (Vercel CDN + Railway/Render container).

---

## 1. Provisioning a Cloud SQL Server Database

Since traditional serverless architectures struggle with continuous relational connection pooling, you need a managed, cloud-hosted **Microsoft SQL Server**. Two optimal options exist:

### Option A: Azure SQL Database (Recommended / Free Tier Compatible)
Microsoft Azure offers a robust free tier for Azure SQL Database (100,000 vCore-seconds per month).
1.  **Sign Up**: Create an account on the [Azure Portal](https://portal.azure.com).
2.  **Create Resource**: Search for **SQL Database** and click **Create**.
3.  **Configure Basics**:
    *   *Subscription*: Select your subscription.
    *   *Resource Group*: Create a new group (e.g., `Portfolio-RG`).
    *   *Database Name*: Enter `PortfolioDb`.
    *   *Server*: Create a new server (e.g., `portfolio-server-sql`), set location near your users, and choose **Use SQL Authentication**.
    *   *Admin Login*: Set `dbadmin`.
    *   *Password*: Set an ultra-secure password.
4.  **Configure Compute/Storage**: Select the **Serverless** compute tier (allows the DB to pause during inactive hours, preserving free credits).
5.  **Firewall Rules (Critical)**:
    *   Go to the SQL Server resource -> **Networking**.
    *   Enable **Allow Azure services and resources to access this server** (allows your Railway/Render container to connect).
    *   Add your local IP address to the firewall rules (enables you to run migrations from your local terminal).

### Option B: Aiven for SQL Server (Managed / Free Trial)
Aiven offers cloud database hosting across multiple providers (AWS, GCP, Azure).
1.  Sign up on [Aiven.io](https://aiven.io).
2.  Select **Create Service** and choose **SQL Server**.
3.  Select the free-trial single-node configuration.
4.  Once running, note the **Host**, **Port**, **User**, and **Password** from the dashboard.

---

## 2. Secure Connection Strings & Environment Variables

Never commit passwords or connection strings to git repositories. We inject the connection string in production using **Environment Variables**.

### 2.1 Format of the Production Connection String
Construct your connection string using the credentials gathered during provisioning:
```
Server=tcp:portfolio-server-sql.database.windows.net,1433;Initial Catalog=PortfolioDb;Persist Security Info=False;User ID=dbadmin;Password=YOUR_SECURE_PASSWORD;MultipleActiveResultSets=True;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 2.2 Adding Variables in Railway / Render
ASP.NET Core automatically parses nested configuration keys separated by double underscores (`__`) from environment variables.
1.  Navigate to your app deployment dashboard on Railway or Render.
2.  Go to the **Variables** or **Environment** tab.
3.  Add the following key-value pair:
    *   **KEY**: `ConnectionStrings__DefaultConnection`
    *   **VALUE**: `Server=tcp:your-server... [Your Full Connection String]`
4.  Save and redeploy the container. ASP.NET will automatically override `appsettings.json` and use this secure production database connection!

---

## 3. Remote Migrations Pipeline

You do not need to manually write SQL tables in the cloud. You can push your compiled C# migrations directly from your local development machine to your cloud database.

### Step-by-Step Push Command
1.  Ensure your local IP address is whitelisted in your Cloud database networking panel (e.g., Azure SQL Firewall).
2.  Open your terminal in `c:\Users\Tosh\OneDrive\Documents\WebApplication1`.
3.  Run the Entity Framework update tool, passing the remote connection string explicitly:
    ```bash
    dotnet ef database update --connection "Server=tcp:your-server.database.windows.net,1433;Initial Catalog=PortfolioDb;User ID=dbadmin;Password=YOUR_SECURE_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    ```
4.  **Result**: EF Core queries the cloud database, creates the required schemas, establishes indexes, and seeds the default admin user and initial articles instantly in the cloud!

---

## 4. Deploying the Container (Railway or Render)

Your container handles Razor views, controllers, and database access.

### 4.1 On Railway
1.  Connect your GitHub account to [Railway.app](https://railway.app).
2.  Click **New Project** -> **Deploy from GitHub repo** -> Select `Hackathon---ISKOncern`.
3.  Railway will detect the `Dockerfile` at the root and automatically build the container.
4.  Add your database connection environment variable in the **Variables** tab.
5.  Go to **Settings** -> **Public Domain** -> click **Generate Domain** (e.g. `https://your-mvc-app.up.railway.app`). Note this URL!

---

## 5. Launching the Vercel Edge Proxy

Vercel acts as your high-speed static CDN.

1.  Log into the [Vercel Dashboard](https://vercel.com).
2.  Click **Add New** -> **Project** -> Select your `Hackathon---ISKOncern` repo.
3.  **Vercel Configuration Settings**:
    *   *Build Command*: Leave blank (Vercel only serves public assets directly).
    *   *Output Directory*: `wwwroot` (tells Vercel where your static files live).
4.  In the project root, ensure `vercel.json` matches your Railway URL:
    ```json
    {
      "version": 2,
      "rewrites": [
        { "source": "/css/(.*)", "destination": "/wwwroot/css/$1" },
        { "source": "/js/(.*)", "destination": "/wwwroot/js/$1" },
        { "source": "/lib/(.*)", "destination": "/wwwroot/lib/$1" },
        { "source": "/(.*)", "destination": "https://your-mvc-app.up.railway.app/$1" }
      ]
    }
    ```
5.  Click **Deploy**.
6.  **Done!** Vercel distributes your CSS designs and JS scripts across its global edge network, proxying all dynamic portfolio details, blog lookups, and administrative panel submissions back to your active Railway container securely.
