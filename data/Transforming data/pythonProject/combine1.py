import pandas as pd

# Load the datasets with specified encoding
avoidable_mortality = pd.read_csv('avoidable_mortality.csv', encoding='latin1')
foreign_data = pd.read_csv('%foreign_only_data.csv', encoding='latin1')

# Merge datasets on common columns
merged_data = pd.merge(
    avoidable_mortality, 
    foreign_data, 
    on=['COU', 'Country', 'Year'], 
    how='outer',
    suffixes=('_avoidable', '_foreign')
)

# Drop countries that are not present in both datasets
countries_in_avoidable = set(avoidable_mortality['Country'].unique())
countries_in_foreign = set(foreign_data['Country'].unique())
common_countries = countries_in_avoidable.intersection(countries_in_foreign)
merged_data = merged_data[merged_data['Country'].isin(common_countries)]

# Reorder columns for better readability
merged_data = merged_data[['COU', 'Country', 'Year', 
                           'Variable_avoidable', 'Health_Performance_Value', 
                           'Variable_foreign', 'Foreign_%_Value']]

# Save the combined dataset to a new CSV file
merged_data.to_csv('combined_datasetForScatter.csv', index=False)

print("Datasets combined and saved to 'combined_dataset.csv'")
