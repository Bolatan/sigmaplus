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