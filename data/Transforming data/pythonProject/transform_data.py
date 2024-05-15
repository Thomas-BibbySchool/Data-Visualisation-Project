import pandas as pd

# Load the dataset
data = pd.read_csv("healthcare_performance_only_data2.csv")

# Drop rows where the 'Value' column is NaN
data.dropna(subset=['Value'], inplace=True)

# Group by 'COU', 'Country', and 'Year', then calculate the mean of 'Value'
average_data = data.groupby(['COU', 'Country', 'Year'])['Value'].mean().reset_index()

# Save the transformed data to a new CSV file
average_data.to_csv("transformed_dataset.csv", index=False)

print("Transformation complete. The transformed dataset is saved as 'transformed_dataset.csv'.")
