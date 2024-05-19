import pandas as pd

# Load the CSV data with a specified encoding
file_path = '%foreign_only_data2.csv'  # Replace with the path to your CSV file
data = pd.read_csv(file_path, encoding='ISO-8859-1')  # or use 'cp1252' if 'ISO-8859-1' doesn't work

# Function to check if years are consecutive
def has_consecutive_years(group):
    sorted_years = sorted(group['Year'].unique())
    return all(y - x == 1 for x, y in zip(sorted_years, sorted_years[1:]))

# Group data by country and filter
grouped = data.groupby('Country')
filtered_groups = [group for name, group in grouped if has_consecutive_years(group)]

# Concatenate all filtered groups into a new DataFrame
filtered_data = pd.concat(filtered_groups)

# Save the filtered data to a new CSV file
filtered_data.to_csv('filtered_data_linegraph_more_years.csv', index=False)

print("Filtered data has been saved to 'filtered_data.csv'.")
