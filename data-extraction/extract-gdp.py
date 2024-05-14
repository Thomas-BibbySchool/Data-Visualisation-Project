import pandas as pd

# Load the data from the specified CSV file
file_path = 'D:/uni/CapStone/Data-Visualisation-Project/data-extraction/gdp.csv'
data = pd.read_csv(file_path)

# Filter data for the year 2021 and entries that are per capita
# Update the column names based on your specific dataset structure
gdp_2021_capita = data[(data['Year'] == 2021) & (data['Measure'].str.contains('/capita, national currency units'))]

# Select only the 'Country' and 'Value' columns for output
gdp_2021_filtered = gdp_2021_capita[['Country', 'Value']]

# Save the filtered data to a new CSV file
output_path = 'D:/uni/CapStone/Data-Visualisation-Project/data/2021_country_gdp_per_capita.csv'
gdp_2021_filtered.to_csv(output_path, index=False)

print("Filtered GDP per capita data for 2021 saved to:", output_path)
