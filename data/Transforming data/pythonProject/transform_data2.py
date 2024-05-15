import pandas as pd

# Load the datasets
healthcare_performance = pd.read_csv('heathcarePerformanceDataset.csv')
doctors_percentage = pd.read_csv('%doctor.csv')

# Display the first few rows of each dataset to understand their structure
print("Healthcare Performance Dataset:")
print(healthcare_performance.head())

print("\nDoctors Percentage Dataset:")
print(doctors_percentage.head())

# Merge the datasets on 'Country' and 'Year' columns
merged_data = pd.merge(healthcare_performance, doctors_percentage, on=['Country', 'Year'], how='outer')

# Handle missing records by filling NaNs with an appropriate value or dropping them
# For this example, we'll fill NaNs with 0. You can choose to drop them if more appropriate.
merged_data.fillna(0, inplace=True)

# Save the merged dataset to a new CSV file
merged_data.to_csv('merged_healthcare_doctors.csv', index=False)

print("Merging complete. The merged dataset is saved as 'merged_healthcare_doctors.csv'.")
