# sigmaplus

## CSV Upload Format

To upload survey responses in bulk, you'll need to format your data in a CSV file. The system expects specific headers for the columns in your file.

### Survey Questions

For each question in your survey, use the question's unique identifier as the header for the corresponding column in your CSV file. For example, if you have a question with the identifier `product_satisfaction`, the header for that column should be `product_satisfaction`.

### Location and Demographic Data

The system can also process location and demographic information if you provide it in the CSV file. Use the following headers for this data:

- `location_city`: The city where the response was collected.
- `location_state`: The state or region where the response was collected.
- `demographics_age`: The age of the respondent.
- `demographics_gender`: The gender of the respondent.

### Example

Here's an example of what your CSV file might look like:

```csv
product_satisfaction,customer_support_rating,location_city,location_state,demographics_age,demographics_gender
5,4,New York,NY,35,Male
4,5,Los Angeles,CA,28,Female
```

In this example, `product_satisfaction` and `customer_support_rating` are the unique identifiers for the survey questions. The other columns provide additional information about the respondents.

## How to Use

### Generating Reports

1.  Navigate to the "Reports" page.
2.  Click the "Generate Report" button.
3.  Select the survey you want to generate a report for.
4.  Enter a title and description for the report.
5.  Click the "Generate Report" button.

### Editing Report Sections

Admins and agents can edit the content of a report by following these steps:

1.  Navigate to the "Reports" page.
2.  Click the "Edit Sections" button for the report you want to edit. This will take you to a page where you can see all the sections and sub-sections of the report.
3.  For each section and sub-section, there is a text area where you can enter the content.
4.  After you have entered the content for all the sections, click the "Save Changes" button to save your changes.

## Troubleshooting

### "Token Verification Error" / "Authorization Denied"

This error usually means there is a mismatch with the `JWT_SECRET` used to sign and verify authentication tokens. This secret is critical for security.

**Solution:** Ensure the `JWT_SECRET` is configured correctly in all environments.

**1. Local Development (`.env` file):**
- The secret is defined in the `.env` file at the root of the project.
- It must contain a single, non-empty `JWT_SECRET` variable.
- Example: `JWT_SECRET="your_super_secret_and_long_string_for_dev"`

**2. Production Environment (Render):**
- The secret must be set as an environment variable in your service configuration on Render.
- Go to your service's "Environment" tab and add a variable with the key `JWT_SECRET` and a strong, unique value.
- **Important**: This secret must be identical to the one in your local `.env` file if you want tokens to be interchangeable.

**How to Generate a Strong Secret:**
Run this command in your terminal and copy the output:
```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "JWT Expired" / Session Suddenly Ends

If you are logged out unexpectedly, it may be because your authentication token has expired.

**Solution:** The application is now built with an automatic token refresh mechanism. When your token is about to expire, the application will attempt to get a new one in the background without interrupting your session.

If you are still frequently being logged out:
- **Check Server Status:** Ensure the backend server is running and the `/api/auth/refresh` endpoint is accessible.
- **Check System Clock:** An incorrect system clock on either the server or your computer can cause tokens to be considered expired prematurely. Ensure both are set to the correct time.