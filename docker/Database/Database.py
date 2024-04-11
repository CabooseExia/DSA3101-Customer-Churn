import pandas as pd
import sqlite3
import os


if __name__ == '__main__':
    # print(os.getcwd())
    os.chdir('./docker/Database') # why is this needed???????
    df = pd.read_csv('./train_data.csv')
    # print(df.head())

    # Create a connection to SQLite database (or create one if it doesn't exist)
    conn = sqlite3.connect('theyre_taking_the_data_to_isengard.db')

    # Write DataFrame to SQLite database
    df.to_sql('main_table', conn, if_exists='replace', index=False)

    # Close the connection
    conn.close()

    # # Reconnect to the SQLite database
    # conn = sqlite3.connect('theyre_taking_the_data_to_isengard.db')

    # # Query the database using pandas
    # query_result = pd.read_sql_query('SELECT * FROM main_table', conn)

    # # Close the connection
    # conn.close()

    # # Display the query result
    # print(query_result.head())